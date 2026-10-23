<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { Dictionary, useDictStore, useSettings } from '../composables/store'
import { useRuby } from '../composables/ruby'
import { useRuleMatch } from '../composables/rule'
import { RadioGroupItem } from '@nuxt/ui'

const { getDictionary } = useDictStore()
const { showSettings, quickDicts, quickStyle } = useSettings()
const quickDictsValue = computed(() => {
  return quickDicts.value.map(it => getDictionary(it)).filter(it => it !== undefined)
})
function sortQuickDicts(event: Dictionary[]) {
  quickDicts.value = event.map(it => it.id)
}

function clickSettings() {
  showSettings.value = true
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

watch(quickDicts, () => {
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
    <p class="text-muted text-sm">词典优先级从低到高</p>
    <SortableDictionaryList
      :modelValue="quickDictsValue"
      @update:modelValue="sortQuickDicts"
    ></SortableDictionaryList>
    <DictionarySelect v-model="quickDicts" class="mt-2" />
    <h3 class="mt-4">临时样式</h3>
    <UTextarea v-model="quickStyle" class="w-full" :rows="10"></UTextarea>
    <template #footer>
      <div class="text-xs text-muted max-w-sm">
        为优化体验，同种方式开关不会重新导入词典，若在其它页面修改过词典，请点击设置按钮触发重置缓存，或刷新页面
      </div>
      <div class="flex flex-row items-stretch space-x-18px">
        <UButton v-if="preparing || running" block size="lg" :loading="preparing" @click="onStop">
          {{ activateButtonText }}
        </UButton>
        <template v-else>
          <UButton block size="lg" :loading="preparing" @click="onStartSimple">
            {{ quickDicts.length > 0 ? '启用临时翻译' : '请选择至少一个词典' }}
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
