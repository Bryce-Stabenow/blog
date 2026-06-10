import { reactive, computed, watch } from "vue";
import type { Plan, PlanNode, PlanEdge, PlannerState, PlanExportFile } from "./types";

const STORAGE_KEY = "de-planner:v1";

function uid(): string {
  return crypto.randomUUID();
}

function makePlan(name: string, nodes: PlanNode[] = []): Plan {
  const now = Date.now();
  return {
    id: uid(),
    name,
    nodes,
    edges: [],
    camera: { x: 0, y: 0, zoom: 1 },
    createdAt: now,
    updatedAt: now,
  };
}

function makeStarterPlan(): Plan {
  return makePlan("My first plan", [
    {
      id: uid(),
      title: "Double-click me to edit",
      details: "Drag me around. Drag the circle on my edge onto another node to connect us.",
      x: 80,
      y: 80,
    },
  ]);
}

function isValidPlan(plan: unknown): plan is Plan {
  if (typeof plan !== "object" || plan === null) return false;
  const p = plan as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    Array.isArray(p.nodes) &&
    Array.isArray(p.edges) &&
    p.nodes.every(
      (n: any) =>
        n &&
        typeof n.id === "string" &&
        typeof n.title === "string" &&
        typeof n.x === "number" &&
        typeof n.y === "number"
    ) &&
    p.edges.every(
      (e: any) => e && typeof e.id === "string" && typeof e.from === "string" && typeof e.to === "string"
    )
  );
}

function sanitizePlan(plan: Plan): Plan {
  const nodeIds = new Set(plan.nodes.map((n) => n.id));
  return {
    ...plan,
    nodes: plan.nodes.map((n) => ({ ...n, details: typeof n.details === "string" ? n.details : "" })),
    edges: plan.edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to) && e.from !== e.to),
    camera:
      plan.camera &&
      typeof plan.camera.x === "number" &&
      typeof plan.camera.y === "number" &&
      typeof plan.camera.zoom === "number"
        ? plan.camera
        : { x: 0, y: 0, zoom: 1 },
  };
}

function loadState(): PlannerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.plans) && parsed.plans.every(isValidPlan)) {
        const plans = parsed.plans.map(sanitizePlan);
        if (plans.length > 0) {
          const activePlanId = plans.some((p: Plan) => p.id === parsed.activePlanId)
            ? parsed.activePlanId
            : plans[0].id;
          return { version: 1, activePlanId, plans };
        }
      }
    }
  } catch {
    // corrupt storage -> fresh state
  }
  const starter = makeStarterPlan();
  return { version: 1, activePlanId: starter.id, plans: [starter] };
}

const state = reactive<PlannerState>(loadState());

let saveTimer: ReturnType<typeof setTimeout> | undefined;
watch(
  state,
  () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // storage full or unavailable; nothing useful to do
      }
    }, 300);
  },
  { deep: true }
);

const activePlan = computed<Plan>(() => {
  return state.plans.find((p) => p.id === state.activePlanId) ?? state.plans[0];
});

function touch() {
  activePlan.value.updatedAt = Date.now();
}

// --- Node CRUD ---

function addNode(at: { x: number; y: number }): PlanNode {
  const node: PlanNode = { id: uid(), title: "New node", details: "", x: at.x, y: at.y };
  activePlan.value.nodes.push(node);
  touch();
  return node;
}

function updateNode(id: string, patch: Partial<Pick<PlanNode, "title" | "details">>) {
  const node = activePlan.value.nodes.find((n) => n.id === id);
  if (!node) return;
  Object.assign(node, patch);
  touch();
}

function moveNode(id: string, x: number, y: number) {
  const node = activePlan.value.nodes.find((n) => n.id === id);
  if (!node) return;
  node.x = x;
  node.y = y;
  touch();
}

function deleteNode(id: string) {
  const plan = activePlan.value;
  plan.nodes = plan.nodes.filter((n) => n.id !== id);
  plan.edges = plan.edges.filter((e) => e.from !== id && e.to !== id);
  touch();
}

// --- Edge CRUD ---

function addEdge(from: string, to: string): PlanEdge | null {
  const plan = activePlan.value;
  if (from === to) return null;
  if (plan.edges.some((e) => e.from === from && e.to === to)) return null;
  if (!plan.nodes.some((n) => n.id === from) || !plan.nodes.some((n) => n.id === to)) return null;
  const edge: PlanEdge = { id: uid(), from, to };
  plan.edges.push(edge);
  touch();
  return edge;
}

function deleteEdge(id: string) {
  const plan = activePlan.value;
  plan.edges = plan.edges.filter((e) => e.id !== id);
  touch();
}

// --- Plan CRUD ---

function createPlan(): Plan {
  let n = state.plans.length + 1;
  let name = `Untitled plan ${n}`;
  while (state.plans.some((p) => p.name === name)) {
    name = `Untitled plan ${++n}`;
  }
  const plan = makePlan(name);
  state.plans.push(plan);
  state.activePlanId = plan.id;
  return plan;
}

function renamePlan(id: string, name: string) {
  const plan = state.plans.find((p) => p.id === id);
  if (!plan || !name.trim()) return;
  plan.name = name.trim();
  plan.updatedAt = Date.now();
}

function deletePlan(id: string) {
  state.plans = state.plans.filter((p) => p.id !== id);
  // Invariant: at least one plan always exists
  if (state.plans.length === 0) {
    state.plans.push(makeStarterPlan());
  }
  if (!state.plans.some((p) => p.id === state.activePlanId)) {
    state.activePlanId = state.plans[0].id;
  }
}

function setActivePlan(id: string) {
  if (state.plans.some((p) => p.id === id)) {
    state.activePlanId = id;
  }
}

// --- Import / export ---

function exportActivePlan() {
  const file: PlanExportFile = { type: "de-planner", version: 1, plan: activePlan.value };
  const json = JSON.stringify(file, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = activePlan.value.name.replace(/[^a-z0-9-_ ]/gi, "").trim() || "plan";
  a.href = url;
  a.download = `${safeName}.deplan.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importPlan(json: string): { ok: true } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  const file = parsed as Partial<PlanExportFile>;
  if (file?.type !== "de-planner" || file.version !== 1 || !isValidPlan(file.plan)) {
    return { ok: false, error: "That doesn't look like a De-Planner export." };
  }
  const plan = sanitizePlan(file.plan as Plan);
  plan.id = uid();
  if (state.plans.some((p) => p.name === plan.name)) {
    plan.name = `${plan.name} (imported)`;
  }
  state.plans.push(plan);
  state.activePlanId = plan.id;
  return { ok: true };
}

export function usePlannerStore() {
  return {
    state,
    activePlan,
    addNode,
    updateNode,
    moveNode,
    deleteNode,
    addEdge,
    deleteEdge,
    createPlan,
    renamePlan,
    deletePlan,
    setActivePlan,
    exportActivePlan,
    importPlan,
  };
}
