<script lang="ts" setup>
import { computed } from 'vue'
import { useDictStore, useSettings } from '../composables/store'
import { useRuby } from '../composables/ruby'
import { useRuleMatch } from '../composables/rule'

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

const { running, preparing, startSimple, startWithRule, stop } = useRuby()

const activateButtonText = computed(() => {
  if (preparing.value) {
    return '正在启动……'
  }
  if (running.value) {
    return '关闭翻译'
  }
  return '#ERROR'
})

function onStop() {
  if (running.value) {
    stop()
    return
  }
}

const { currentRule } = useRuleMatch()

function onStartSimple() {
  startSimple(quickDicts.value, quickStyle.value)
}
function onStartRule() {
  if (currentRule.value) {
    startWithRule(currentRule.value)
  }
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
        <UButton v-if="preparing || running" block size="lg" :loading="preparing" @click="onStop">
          {{ activateButtonText }}
        </UButton>
        <template v-else>
          <UButton block size="lg" :loading="preparing" @click="onStartSimple">
            启用临时翻译
          </UButton>
          <UButton
            block
            size="lg"
            :loading="preparing"
            @click="onStartRule"
            :disabled="!currentRule"
          >
            {{ currentRule ? '启用规则翻译' : '当前无匹配规则' }}
          </UButton>
        </template>
        <UButton class="flex-none" color="secondary" size="lg" @click="clickSettings">
          <div class="i-lucide:settings"></div>
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<style scoped></style>
