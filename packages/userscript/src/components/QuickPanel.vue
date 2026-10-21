<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useDictStore, useSettings } from '../composables/store'
import { useRuby } from '../composables/ruby'
import { useRuleMatch } from '../composables/rule'
import { RadioGroupItem } from '@nuxt/ui'

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

const { rubyMode, css, flags, running, preparing, startSimple, startWithRule, restart, stop } =
  useRuby()

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

watch(selectedDicts, () => {
  flags.simpleDirty = true
})
watch(showSettings, () => {
  flags.simpleDirty = true
  flags.ruleDirty = true
})

function onStartSimple() {
  if (flags.simpleDirty) {
    startSimple(quickDicts.value, quickStyle.value)
    flags.simpleDirty = false
    flags.ruleDirty = true
  } else {
    css.value = quickStyle.value
    restart()
  }
}
function onStartRule() {
  if (currentRule.value) {
    if (flags.ruleDirty) {
      startWithRule(currentRule.value)
      flags.ruleDirty = false
      flags.simpleDirty = true
    } else {
      restart()
    }
  }
}

const rubyModeItems = ref<RadioGroupItem[]>([
  {
    label: '注音模式',
    value: 'both',
  },
  {
    label: '翻译模式',
    value: 'translation-only',
    description: '仅译文',
  },
  {
    label: '反转模式',
    value: 'inverse',
    description: '原文作为注音',
  },
])
</script>

<template>
  <UCard>
    <h3>标记模式</h3>
    <URadioGroup
      v-model="rubyMode"
      orientation="horizontal"
      variant="list"
      :items="rubyModeItems"
    />
    <h3>临时词典</h3>
    <UListbox
      class="max-h-sm"
      multiple
      filter
      :modelValue="selectedDicts"
      @update:modelValue="onSelectDictionaries"
      :items="dictItems"
    ></UListbox>
    <h3 class="mt-4">临时样式</h3>
    <UTextarea v-model="quickStyle" class="w-full" :rows="10"></UTextarea>
    <template #footer>
      <div class="text-xs text-gray max-w-sm">
        为优化体验，同种方式开关不会重新导入词典，若在其它页面修改过词典，请点击设置按钮触发重置缓存，或刷新页面
      </div>
      <div class="flex flex-row items-stretch space-x-lg">
        <UButton v-if="preparing || running" block size="lg" :loading="preparing" @click="onStop">
          {{ activateButtonText }}
        </UButton>
        <template v-else>
          <UButton block size="lg" :loading="preparing" @click="onStartSimple">
            {{ selectedDicts.length > 0 ? '启用临时翻译' : '请选择至少一个词典' }}
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
