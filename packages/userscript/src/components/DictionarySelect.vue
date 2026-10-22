<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'
import { useDictStore } from '../composables/store'
import { portalTarget } from '../shadowRoot'

const selectedDictionaryIDs = defineModel<string[]>('modelValue', { default: () => [] })

const { listDictionaries } = useDictStore()

function onSelectDictionaries(
  value: {
    label: string
    value: string
  }[],
) {
  selectedDictionaryIDs.value = value.map(it => it.value)
}

const selectDictsModal = useTemplateRef('select-dicts')
const selectDictsModalOpen = ref(false)

onClickOutside(selectDictsModal, () => {
  selectDictsModalOpen.value = false
})

const dictItems = computed(() => {
  return listDictionaries()
    .map(it => {
      return {
        label: it.name,
        value: it.id,
      }
    })
    .toArray()
    .sort((a, b) => {
      const valueA = selectedDictionaryIDs.value.includes(a.value) ? 0 : 1
      const valueB = selectedDictionaryIDs.value.includes(b.value) ? 0 : 1
      return valueA - valueB
    })
})
const selectedDicts = computed(() => {
  return dictItems.value.filter(it => selectedDictionaryIDs.value.includes(it.value))
})
</script>

<template>
  <UModal
    v-model:open="selectDictsModalOpen"
    :portal="portalTarget"
    :dismissible="true"
    :modal="true"
    :overlay="true"
    title="选择词典"
    scrollable
  >
    <UButton block>选择词典</UButton>
    <template #content>
      <div ref="select-dicts">
        <UListbox
          class="max-h-sm"
          multiple
          filter
          :modelValue="selectedDicts"
          @update:modelValue="onSelectDictionaries"
          :items="dictItems"
        ></UListbox>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
