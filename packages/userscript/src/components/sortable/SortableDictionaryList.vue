<script lang="ts" setup>
import { ComponentPublicInstance, reactive } from 'vue'
import { Dictionary } from '../../composables/store'
import { DragDropProvider, DragEndEvent } from '@dnd-kit/vue'
import { move } from '@dnd-kit/helpers'

const dictionaries = defineModel<Dictionary[]>('modelValue', { default: () => [] })

const handles = reactive<(HTMLElement | null)[]>([])

function setHandle(idx: number, el: Element | ComponentPublicInstance | null) {
  if (el instanceof Element || !el) {
    handles[idx] = el as HTMLElement | null
  } else {
    handles[idx] = el.$el
  }
}

function onDragEnd(event: DragEndEvent) {
  dictionaries.value = move(dictionaries.value, event)
}
</script>

<template>
  <div>
    <DragDropProvider v-if="dictionaries.length > 0" @dragEnd="onDragEnd">
      <ul>
        <SortableItem
          v-for="(dict, idx) in dictionaries"
          :key="dict.id"
          :id="dict.id"
          :index="idx"
          as="li"
          class=""
        >
          <div
            class="flex flex-row gap-1 items-center border border-gray/50 rounded-sm shadow p-1 bg-white"
          >
            <!-- change name -->
            <UIcon
              name="i-lucide:grip-vertical"
              class="hover:cursor-grab"
              :ref="el => setHandle(idx, el)"
            />
            <div class="flex-1">{{ dict.name }}</div>
            <!-- timestamp -->
            <div class="flex-initial text-xs">
              {{ new Date(dict.createTime).toLocaleDateString() }}
            </div>
          </div>
        </SortableItem>
      </ul>
    </DragDropProvider>
    <UEmpty v-else icon="i-lucide:book-dashed" title="未添加/找到词典"></UEmpty>
  </div>
</template>

<style scoped></style>
