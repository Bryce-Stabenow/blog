<script setup lang="ts">
import { ref } from "vue";
import Toolbar from "./Toolbar.vue";
import PlanCanvas from "./PlanCanvas.vue";

const canvas = ref<InstanceType<typeof PlanCanvas> | null>(null);
</script>

<template>
    <div class="w-full">
        <Toolbar
            @add-node="canvas?.addNodeAtCenter()"
            @reset-view="canvas?.resetView()"
        />
        <PlanCanvas ref="canvas" />
        <p class="mt-2 text-sm">
            Drag the background to pan, ctrl/cmd + scroll to zoom. Double-click
            a node to edit it, or double-click empty space to add one. Drag the
            circle on a node's edge onto another node to connect them.
        </p>
    </div>
</template>
