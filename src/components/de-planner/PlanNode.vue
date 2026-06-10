<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";
import type { PlanNode } from "./types";
import { usePlannerStore } from "./usePlannerStore";

const props = defineProps<{
    node: PlanNode;
    zoom: number;
    selected: boolean;
    linkTarget: boolean;
}>();

const emit = defineEmits<{
    (e: "select"): void;
    (e: "link-start", fromId: string, event: PointerEvent): void;
    (e: "resize", id: string, size: { width: number; height: number }): void;
}>();

const store = usePlannerStore();
const root = ref<HTMLElement | null>(null);

// --- Drag ---

let drag: {
    pointerId: number;
    startX: number;
    startY: number;
    nodeX: number;
    nodeY: number;
    moved: boolean;
} | null = null;

function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, button, .dp-handle")) return;
    e.stopPropagation();
    try {
        root.value!.setPointerCapture(e.pointerId);
    } catch {
        // pointer already gone — drag still works via bubbled moves
    }
    drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        nodeX: props.node.x,
        nodeY: props.node.y,
        moved: false,
    };
}

function onPointerMove(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    if (drag.moved) {
        // Screen deltas must be divided by zoom to stay under the cursor
        store.moveNode(
            props.node.id,
            drag.nodeX + dx / props.zoom,
            drag.nodeY + dy / props.zoom,
        );
    }
}

function onPointerUp(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (!drag.moved) emit("select");
    drag = null;
}

// --- Inline editing ---

const editing = ref<"title" | "details" | null>(null);
const draft = ref("");
const editField = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);

function startEdit(field: "title" | "details") {
    editing.value = field;
    draft.value = props.node[field];
    nextTick(() => {
        // preventScroll: focusing a node clipped by the viewport's overflow-hidden
        // would otherwise browser-scroll the viewport and desync the camera math
        editField.value?.focus({ preventScroll: true });
        editField.value?.select();
    });
}

function commitEdit() {
    if (!editing.value) return;
    if (editing.value === "title" && !draft.value.trim()) {
        draft.value = props.node.title;
    }
    store.updateNode(props.node.id, { [editing.value]: draft.value.trim() });
    editing.value = null;
}

function cancelEdit() {
    editing.value = null;
}

// --- Size reporting (offset dims are layout px = world units, unaffected by scale) ---

let observer: ResizeObserver | null = null;

onMounted(() => {
    observer = new ResizeObserver(() => {
        if (!root.value) return;
        emit("resize", props.node.id, {
            width: root.value.offsetWidth,
            height: root.value.offsetHeight,
        });
    });
    observer.observe(root.value!);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
    <div
        ref="root"
        :data-node-id="node.id"
        class="dp-node group absolute w-[210px] rounded-lg border bg-theme-sidebar text-theme-text shadow-md px-3 py-2"
        :class="[
            selected
                ? 'border-theme-accent ring-2 ring-theme-accent'
                : 'border-theme-border-btn',
            linkTarget ? 'ring-2 ring-theme-accent border-theme-accent' : '',
        ]"
        :style="{ left: node.x + 'px', top: node.y + 'px', touchAction: 'none' }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @dblclick.stop
    >
        <button
            class="absolute -top-2 -right-2 w-5 h-5 leading-none rounded-full border border-theme-border-btn bg-theme-main text-theme-text-secondary text-xs opacity-0 group-hover:opacity-100 hover:text-theme-accent transition"
            title="Delete node"
            @click="store.deleteNode(node.id)"
        >
            ×
        </button>

        <h4
            v-if="editing !== 'title'"
            class="font-bold text-sm break-words"
            @dblclick="startEdit('title')"
        >
            {{ node.title }}
        </h4>
        <input
            v-else
            ref="editField"
            v-model="draft"
            class="w-full text-sm font-bold bg-theme-main text-theme-text border border-theme-accent rounded px-1 outline-none"
            @blur="commitEdit"
            @keydown.stop
            @keydown.enter.prevent="commitEdit"
            @keydown.esc.prevent="cancelEdit"
            @pointerdown.stop
        />

        <p
            v-if="editing !== 'details'"
            class="mt-1 text-xs whitespace-pre-wrap break-words"
            :class="node.details ? 'text-theme-text-secondary' : 'text-theme-icon-idle italic'"
            @dblclick="startEdit('details')"
        >
            {{ node.details || "Double-click to add details" }}
        </p>
        <textarea
            v-else
            ref="editField"
            v-model="draft"
            rows="3"
            class="mt-1 w-full text-xs bg-theme-main text-theme-text border border-theme-accent rounded px-1 outline-none resize-none"
            @blur="commitEdit"
            @keydown.stop
            @keydown.esc.prevent="cancelEdit"
            @pointerdown.stop
        ></textarea>

        <div
            class="dp-handle absolute top-1/2 -right-[9px] -translate-y-1/2 w-[18px] h-[18px] rounded-full border-2 border-theme-accent bg-theme-main opacity-40 group-hover:opacity-100 cursor-crosshair transition"
            title="Drag to another node to add a connection"
            style="touch-action: none"
            @pointerdown.stop.prevent="emit('link-start', node.id, $event)"
        ></div>
    </div>
</template>
