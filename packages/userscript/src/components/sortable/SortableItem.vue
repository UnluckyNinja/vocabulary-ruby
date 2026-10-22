<script lang="ts" setup>
import { useSortable } from '@dnd-kit/vue/sortable'
import { useTemplateRef } from 'vue'

const props = withDefaults(
  defineProps<{
    id: string
    index: number
    handle?: HTMLElement | null
    as?: string
  }>(),
  {
    handle: null,
    as: 'div',
  },
)

const element = useTemplateRef<HTMLElement>('wrapper')
useSortable({
  id: () => props.id,
  index: () => props.index,
  element,
  handle: () => props.handle,
})
</script>

<template>
  <component :is="props.as" ref="wrapper">
    <slot></slot>
  </component>
</template>

<style scoped></style>
