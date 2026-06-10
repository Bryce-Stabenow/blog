<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { usePlannerStore } from "./usePlannerStore";

const emit = defineEmits<{
    (e: "add-node"): void;
    (e: "reset-view"): void;
}>();

const store = usePlannerStore();

const zoomPercent = computed(() =>
    Math.round(store.activePlan.value.camera.zoom * 100),
);

// --- Rename ---

const renaming = ref(false);
const renameDraft = ref("");
const renameField = ref<HTMLInputElement | null>(null);

function startRename() {
    renaming.value = true;
    renameDraft.value = store.activePlan.value.name;
    nextTick(() => {
        renameField.value?.focus();
        renameField.value?.select();
    });
}

function commitRename() {
    store.renamePlan(store.activePlan.value.id, renameDraft.value);
    renaming.value = false;
}

function confirmDelete() {
    if (confirm(`Delete plan "${store.activePlan.value.name}"?`)) {
        store.deletePlan(store.activePlan.value.id);
    }
}

// --- Import ---

const fileInput = ref<HTMLInputElement | null>(null);
const importError = ref("");
let errorTimer: ReturnType<typeof setTimeout> | undefined;

async function onFileChosen() {
    const file = fileInput.value?.files?.[0];
    if (!file) return;
    const result = store.importPlan(await file.text());
    if (!result.ok) {
        importError.value = result.error;
        clearTimeout(errorTimer);
        errorTimer = setTimeout(() => (importError.value = ""), 5000);
    }
    fileInput.value!.value = "";
}
</script>

<template>
    <div class="w-full mb-2">
        <div class="flex flex-wrap items-center gap-2">
            <select
                v-if="!renaming"
                :value="store.state.activePlanId"
                class="bg-theme-main text-theme-text border border-theme-border-btn rounded px-2 py-1 text-sm max-w-[180px]"
                title="Switch plan"
                @change="store.setActivePlan(($event.target as HTMLSelectElement).value)"
            >
                <option v-for="plan in store.state.plans" :key="plan.id" :value="plan.id">
                    {{ plan.name }}
                </option>
            </select>
            <input
                v-else
                ref="renameField"
                v-model="renameDraft"
                class="bg-theme-main text-theme-text border border-theme-accent rounded px-2 py-1 text-sm max-w-[180px] outline-none"
                @blur="commitRename"
                @keydown.enter.prevent="commitRename"
                @keydown.esc.prevent="renaming = false"
            />

            <button class="dp-btn" title="New plan" @click="store.createPlan()">
                New
            </button>
            <button class="dp-btn" title="Rename this plan" @click="startRename">
                Rename
            </button>
            <button class="dp-btn" title="Delete this plan" @click="confirmDelete">
                Delete
            </button>

            <span class="w-px h-5 bg-theme-border-btn mx-1 hidden sm:block"></span>

            <button
                class="dp-btn font-bold text-theme-accent"
                title="Add a node at the center of the view"
                @click="emit('add-node')"
            >
                + Node
            </button>

            <span class="w-px h-5 bg-theme-border-btn mx-1 hidden sm:block"></span>

            <button
                class="dp-btn"
                title="Download this plan as JSON"
                @click="store.exportActivePlan()"
            >
                Export
            </button>
            <button
                class="dp-btn"
                title="Import a plan from JSON"
                @click="fileInput?.click()"
            >
                Import
            </button>
            <input
                ref="fileInput"
                type="file"
                accept=".json,application/json"
                class="hidden"
                @change="onFileChosen"
            />

            <button
                class="dp-btn ml-auto tabular-nums"
                title="Reset zoom and center the view"
                @click="emit('reset-view')"
            >
                {{ zoomPercent }}%
            </button>
        </div>
        <p v-if="importError" class="mt-1 text-sm text-theme-accent">
            {{ importError }}
        </p>
    </div>
</template>

<style scoped>
.dp-btn {
    border: 1px solid var(--theme-border-btn);
    color: var(--theme-text);
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition: background-color 100ms;
}
.dp-btn:hover {
    background-color: var(--theme-card-hover);
}
</style>
