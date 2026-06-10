<script setup lang="ts">
import { ref, computed, reactive, onMounted, onBeforeUnmount } from "vue";
import { usePlannerStore } from "./usePlannerStore";
import type { Selection } from "./types";
import PlanNode from "./PlanNode.vue";

const store = usePlannerStore();

const viewport = ref<HTMLElement | null>(null);
const worldEl = ref<HTMLElement | null>(null);

const cam = computed(() => store.activePlan.value.camera);

// Measured node card sizes in world units (offsetWidth/Height, unaffected by scale)
const sizes = reactive(new Map<string, { width: number; height: number }>());

const selection = ref<Selection>(null);

const worldStyle = computed(() => ({
    transform: `translate(${cam.value.x}px, ${cam.value.y}px) scale(${cam.value.zoom})`,
}));

function screenToWorld(clientX: number, clientY: number) {
    const r = viewport.value!.getBoundingClientRect();
    return {
        x: (clientX - r.left - cam.value.x) / cam.value.zoom,
        y: (clientY - r.top - cam.value.y) / cam.value.zoom,
    };
}

// --- Pan (drag the background) ---

const panning = ref(false);
let pan: { pointerId: number; lastX: number; lastY: number } | null = null;

function onBgPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    if (e.target !== viewport.value && e.target !== worldEl.value) return;
    selection.value = null;
    viewport.value!.focus({ preventScroll: true });
    try {
        viewport.value!.setPointerCapture(e.pointerId);
    } catch {
        // pointer already gone (e.g. pen lifted) — pan still works via bubbled moves
    }
    pan = { pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY };
    panning.value = true;
}

function onBgPointerMove(e: PointerEvent) {
    if (!pan || e.pointerId !== pan.pointerId) return;
    cam.value.x += e.clientX - pan.lastX;
    cam.value.y += e.clientY - pan.lastY;
    pan.lastX = e.clientX;
    pan.lastY = e.clientY;
}

function onBgPointerUp(e: PointerEvent) {
    if (pan && e.pointerId === pan.pointerId) {
        pan = null;
        panning.value = false;
    }
}

// --- Zoom (wheel; pinch arrives as ctrlKey wheel) ---

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.5;

function onWheel(e: WheelEvent) {
    e.preventDefault();
    const c = cam.value;
    if (e.ctrlKey || e.metaKey) {
        const r = viewport.value!.getBoundingClientRect();
        const mx = e.clientX - r.left;
        const my = e.clientY - r.top;
        const newZoom = Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, c.zoom * Math.exp(-e.deltaY * 0.0015)),
        );
        const k = newZoom / c.zoom;
        c.x = mx - (mx - c.x) * k;
        c.y = my - (my - c.y) * k;
        c.zoom = newZoom;
    } else {
        c.x -= e.deltaX;
        c.y -= e.deltaY;
    }
}

onMounted(() => {
    // Must be non-passive or preventDefault() is ignored and the page scrolls
    viewport.value!.addEventListener("wheel", onWheel, { passive: false });
    // The browser can still scroll an overflow-hidden box (focus, find-in-page),
    // which would silently offset every screen<->world conversion. Pin it at 0.
    viewport.value!.addEventListener("scroll", onViewportScroll);
});

function onViewportScroll() {
    const vp = viewport.value;
    if (!vp) return;
    vp.scrollLeft = 0;
    vp.scrollTop = 0;
}

onBeforeUnmount(() => {
    viewport.value?.removeEventListener("wheel", onWheel);
    viewport.value?.removeEventListener("scroll", onViewportScroll);
    window.removeEventListener("pointermove", onLinkMove);
    window.removeEventListener("pointerup", onLinkUp);
});

// --- Edge geometry ---

// Point on the border of a rect (center c, half-size h) along the ray toward t
function borderPoint(
    c: { x: number; y: number },
    half: { w: number; h: number },
    t: { x: number; y: number },
) {
    const dx = t.x - c.x;
    const dy = t.y - c.y;
    if (dx === 0 && dy === 0) return { x: c.x, y: c.y };
    const s = Math.min(
        dx !== 0 ? half.w / Math.abs(dx) : Infinity,
        dy !== 0 ? half.h / Math.abs(dy) : Infinity,
    );
    return { x: c.x + dx * s, y: c.y + dy * s };
}

function nodeCenter(id: string) {
    const node = store.activePlan.value.nodes.find((n) => n.id === id);
    const size = sizes.get(id);
    if (!node || !size) return null;
    return {
        c: { x: node.x + size.width / 2, y: node.y + size.height / 2 },
        half: { w: size.width / 2, h: size.height / 2 },
    };
}

const edgePaths = computed(() => {
    const out: { id: string; d: string }[] = [];
    for (const edge of store.activePlan.value.edges) {
        const a = nodeCenter(edge.from);
        const b = nodeCenter(edge.to);
        if (!a || !b) continue;
        const p1 = borderPoint(a.c, a.half, b.c);
        const p2 = borderPoint(b.c, b.half, a.c);
        // Overlapping/too-close rects produce a backwards segment; skip it
        const along =
            (p2.x - p1.x) * (b.c.x - a.c.x) + (p2.y - p1.y) * (b.c.y - a.c.y);
        if (along <= 0) continue;
        // Pull the endpoint back so the arrow tip sits on the border
        const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const t = (d - 2) / d;
        const ex = p1.x + (p2.x - p1.x) * t;
        const ey = p1.y + (p2.y - p1.y) * t;
        out.push({ id: edge.id, d: `M ${p1.x} ${p1.y} L ${ex} ${ey}` });
    }
    return out;
});

function onNodeResize(id: string, size: { width: number; height: number }) {
    sizes.set(id, size);
}

function selectEdge(id: string) {
    selection.value = { kind: "edge", id };
    viewport.value!.focus({ preventScroll: true });
}

// --- Linking (drag from a node's handle to another node) ---

const linking = ref<{
    fromId: string;
    toWorld: { x: number; y: number };
    targetId: string | null;
} | null>(null);

function startLink(fromId: string, e: PointerEvent) {
    linking.value = {
        fromId,
        toWorld: screenToWorld(e.clientX, e.clientY),
        targetId: null,
    };
    window.addEventListener("pointermove", onLinkMove);
    window.addEventListener("pointerup", onLinkUp);
}

function onLinkMove(e: PointerEvent) {
    if (!linking.value) return;
    linking.value.toWorld = screenToWorld(e.clientX, e.clientY);
    // Pointer capture suppresses enter/leave on other nodes, so hit-test manually
    const el = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest("[data-node-id]");
    const id = el?.getAttribute("data-node-id") ?? null;
    linking.value.targetId = id !== linking.value.fromId ? id : null;
}

function onLinkUp() {
    if (linking.value?.targetId) {
        store.addEdge(linking.value.fromId, linking.value.targetId);
    }
    linking.value = null;
    window.removeEventListener("pointermove", onLinkMove);
    window.removeEventListener("pointerup", onLinkUp);
}

const previewPath = computed(() => {
    if (!linking.value) return null;
    const a = nodeCenter(linking.value.fromId);
    if (!a) return null;
    const to = linking.value.toWorld;
    const p1 = borderPoint(a.c, a.half, to);
    return `M ${p1.x} ${p1.y} L ${to.x} ${to.y}`;
});

// --- Selection + keyboard delete ---

function onKeydown(e: KeyboardEvent) {
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, [contenteditable]")) return;
    if (!selection.value) return;
    e.preventDefault();
    if (selection.value.kind === "node") {
        store.deleteNode(selection.value.id);
    } else {
        store.deleteEdge(selection.value.id);
    }
    selection.value = null;
}

function selectNode(id: string) {
    selection.value = { kind: "node", id };
    viewport.value!.focus({ preventScroll: true });
}

// --- Toolbar-facing API ---

const NODE_WIDTH = 210;

function addNodeAtCenter(jitter = true) {
    const r = viewport.value!.getBoundingClientRect();
    const w = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    const j = () => (jitter ? (Math.random() - 0.5) * 60 : 0);
    const node = store.addNode({
        x: w.x - NODE_WIDTH / 2 + j(),
        y: w.y - 40 + j(),
    });
    selection.value = { kind: "node", id: node.id };
    viewport.value!.focus({ preventScroll: true });
}

function onBgDblClick(e: MouseEvent) {
    if (e.target !== viewport.value && e.target !== worldEl.value) return;
    const w = screenToWorld(e.clientX, e.clientY);
    const node = store.addNode({ x: w.x - NODE_WIDTH / 2, y: w.y - 20 });
    selection.value = { kind: "node", id: node.id };
}

function resetView() {
    const c = cam.value;
    const nodes = store.activePlan.value.nodes;
    c.zoom = 1;
    if (nodes.length === 0) {
        c.x = 0;
        c.y = 0;
        return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of nodes) {
        const size = sizes.get(n.id) ?? { width: NODE_WIDTH, height: 80 };
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + size.width);
        maxY = Math.max(maxY, n.y + size.height);
    }
    const r = viewport.value!.getBoundingClientRect();
    c.x = r.width / 2 - (minX + maxX) / 2;
    c.y = r.height / 2 - (minY + maxY) / 2;
}

defineExpose({ addNodeAtCenter, resetView });
</script>

<template>
    <div
        ref="viewport"
        tabindex="0"
        class="relative w-full h-[70vh] min-h-[480px] overflow-hidden rounded-lg border border-theme-border-btn bg-theme-main outline-none select-none"
        :class="panning ? 'cursor-grabbing' : 'cursor-grab'"
        style="touch-action: none"
        @pointerdown="onBgPointerDown"
        @pointermove="onBgPointerMove"
        @pointerup="onBgPointerUp"
        @pointercancel="onBgPointerUp"
        @dblclick="onBgDblClick"
        @keydown="onKeydown"
    >
        <div
            ref="worldEl"
            class="absolute top-0 left-0 origin-top-left"
            :style="worldStyle"
        >
            <svg
                class="absolute top-0 left-0 overflow-visible pointer-events-none"
                width="1"
                height="1"
            >
                <defs>
                    <marker
                        id="dp-arrow"
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="9"
                        markerHeight="9"
                        markerUnits="userSpaceOnUse"
                        orient="auto"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--theme-accent)" />
                    </marker>
                </defs>
                <g v-for="edge in edgePaths" :key="edge.id">
                    <path
                        :d="edge.d"
                        fill="none"
                        :stroke="
                            selection?.kind === 'edge' && selection.id === edge.id
                                ? 'var(--theme-accent)'
                                : 'var(--theme-border-btn)'
                        "
                        :stroke-width="
                            selection?.kind === 'edge' && selection.id === edge.id
                                ? 3
                                : 2
                        "
                        marker-end="url(#dp-arrow)"
                    />
                    <path
                        :d="edge.d"
                        fill="none"
                        stroke="transparent"
                        stroke-width="14"
                        class="cursor-pointer"
                        style="pointer-events: stroke"
                        @pointerdown.stop
                        @click.stop="selectEdge(edge.id)"
                    />
                </g>
                <path
                    v-if="previewPath"
                    :d="previewPath"
                    fill="none"
                    stroke="var(--theme-accent)"
                    stroke-width="2"
                    stroke-dasharray="6 4"
                    marker-end="url(#dp-arrow)"
                />
            </svg>

            <PlanNode
                v-for="node in store.activePlan.value.nodes"
                :key="node.id"
                :node="node"
                :zoom="cam.zoom"
                :selected="selection?.kind === 'node' && selection.id === node.id"
                :link-target="linking?.targetId === node.id"
                @select="selectNode(node.id)"
                @link-start="startLink"
                @resize="onNodeResize"
            />
        </div>
    </div>
</template>
