export interface PlanNode {
  id: string;
  title: string;
  details: string;
  // World coordinates (top-left of the node card)
  x: number;
  y: number;
}

// Direction convention: `from` is the dependency, `to` is the dependent.
// "cook breakfast" -> "eat breakfast" -> "leave on time"; arrowhead renders at `to`.
export interface PlanEdge {
  id: string;
  from: string;
  to: string;
}

// screen = world * zoom + (x, y)
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface Plan {
  id: string;
  name: string;
  nodes: PlanNode[];
  edges: PlanEdge[];
  camera: Camera;
  createdAt: number;
  updatedAt: number;
}

export interface PlannerState {
  version: 1;
  activePlanId: string;
  plans: Plan[];
}

export interface PlanExportFile {
  type: "de-planner";
  version: 1;
  plan: Plan;
}

export type Selection = { kind: "node" | "edge"; id: string } | null;
