<script lang="ts" setup>
import { computed } from 'vue'
import { useDictStore, useSettings } from '../composables/store'

const { showSettings, quickDicts, quickStyle } = useSettings()
function clickSettings() {
  showSettings.value = true
}
const { listDictionaries } = useDictStore()
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
      const valueA = quickDicts.value.includes(a.value) ? 0 : 1
      const valueB = quickDicts.value.includes(b.value) ? 0 : 1
      return valueA - valueB
    })
})
const selectedDicts = computed(() => {
  return dictItems.value.filter(it => quickDicts.value.includes(it.value))
})
function onSelectDictionaries(
  value: {
    label: string
    value: string
  }[],
) {
  quickDicts.value = value.map(it => it.value)
}
</script>

<template>
  <UCard>
    <h3>使用词典</h3>
    <UListbox
      class="max-h-sm"
      multiple
      filter
      :modelValue="selectedDicts"
      @update:modelValue="onSelectDictionaries"
      :items="dictItems"
    ></UListbox>
    <h3 class="mt-4">样式规则</h3>
    <UTextarea v-model="quickStyle" class="w-full" :rows="10"></UTextarea>
    <template #footer>
      <div class="flex flex-row items-stretch space-x-lg">
        <UButton block size="lg">启用</UButton>
        <UButton class="flex-none" color="secondary" size="lg" @click="clickSettings">
          <div class="i-lucide:settings"></div>
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<style scoped></style>
