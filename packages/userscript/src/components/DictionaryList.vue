<script lang="ts" setup>
import { Dictionary, useDictStore } from '../composables/store'
const props = withDefaults(
  defineProps<{
    dictionaries: Dictionary[]
    editable?: boolean
  }>(),
  {
    editable: false,
  },
)

const { updateDictionary } = useDictStore()

function onChangeName(dict: Dictionary, newName: string) {
  updateDictionary(dict.id, {
    name: newName,
  })
}
</script>
<template>
  <div class="my-4">
    <ul v-if="dictionaries.length > 0">
      <template v-for="(dict, idx) in dictionaries" :key="dict.id">
        <USeparator class="my-2" v-if="idx > 0"></USeparator>
        <!-- row item -->
        <li class="flex flex-row gap-1 items-center">
          <!-- change name -->
          <UInput
            v-if="editable"
            class="flex-1"
            :modelValue="dict.name"
            @update:modelValue="onChangeName(dict, $event)"
            variant="ghost"
          ></UInput>
          <div v-else class="flex-1">{{ dict.name }}</div>
          <!-- timestamp -->
          <div class="flex-initial text-xs">
            {{ new Date(dict.createTime).toLocaleDateString() }}
          </div>
          <!-- action buttons -->
          <slot name="action" :dict="dict"></slot>
        </li>
      </template>
    </ul>
    <UEmpty v-else icon="i-lucide:book-dashed" title="未添加/找到词典"></UEmpty>
  </div>
</template>

<style scoped></style>
