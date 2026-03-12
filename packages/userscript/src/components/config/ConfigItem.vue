<script setup lang="ts">
import {
  EditableArea,
  EditableInput,
  EditablePreview,
  EditableRoot,
} from 'reka-ui'

const name = defineModel('name', {
  default: 'New Config'
})
const emit = defineEmits<{
  delete: []
}>()
</script>

<template>
  <div class="flex items-center gap-3 rounded-md border border-slate-100 bg-white p-2 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
    <!-- 1. Sort Icon (Drag Handle) -->
    <div class="cursor-grab p-1 text-slate-300 hover:text-slate-500 transition-colors active:cursor-grabbing">
      <div class="i-carbon:draggable h-5 w-5"></div>
    </div>

    <!-- 2. Editable Content (Flex-1 to take available space) -->
    <EditableRoot
      v-model="name"
      placeholder="Enter dictionary name..."
      class="flex-1 min-w-0"
    >
      <EditableArea class="relative flex items-center">
        <EditablePreview class="w-full truncate rounded-md px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors" />
        <EditableInput class="w-full rounded-md border border-blue-200 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
      </EditableArea>
    </EditableRoot>

    <!-- 3. Action Buttons -->
    <div class="flex items-center gap-1 border-l border-slate-100 pl-2">
      <!-- Edit Button (Can also trigger Editable focus if needed) -->
      <slot name="control">
      </slot>

      <!-- Delete Button -->
      <button
        @click="emit('delete')"
        title="Delete this config"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
      >
        <div class="i-carbon:trash-can h-4 w-4"></div>
      </button>
    </div>
  </div>
</template>
