<script lang="ts" setup>
import { Dictionary } from '../composables/store'
const props = withDefaults(
  defineProps<{
    dictionaries: Dictionary[]
    editable?: boolean
  }>(),
  {
    editable: false,
  },
)
</script>
<template>
  <div class="my-4">
    <template v-if="dictionaries.length > 0">
      <template v-for="(dict, idx) in dictionaries" :key="dict.id">
        <USeparator class="my-2" v-if="idx > 0"></USeparator>
        <!-- row item -->
        <div class="flex flex-row gap-1 items-center">
          <!-- change name -->
          <UInput v-if="editable" class="flex-1" v-model="dict.name" variant="ghost"></UInput>
          <div v-else class="flex-1">{{ dict.name }}</div>
          <!-- timestamp -->
          <div class="flex-initial text-xs">
            {{ new Date(dict.createTime).toLocaleDateString() }}
          </div>
          <!-- action buttons -->
          <slot name="action" :dict="dict"></slot>
        </div>
      </template>
    </template>
    <template v-else>
      <UEmpty icon="i-lucide:book-dashed" title="未添加/找到词典"></UEmpty>
    </template>
  </div>
</template>

<style scoped></style>
