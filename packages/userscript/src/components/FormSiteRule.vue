<script lang="ts" setup>
import { FormError, FormSubmitEvent } from '@nuxt/ui'
import { computed, reactive } from 'vue'
import {
  defaultStyle,
  Dictionary,
  SiteRule,
  SiteRuleOptions,
  useDictStore,
} from '../composables/store'
import { isValidSelector } from '../utils'
import { csvFormatRow, csvParseRows } from 'd3-dsv'

const props = defineProps<{
  rule?: SiteRule
}>()

const emit = defineEmits<{
  cancel: []
  submit: [FormSubmitEvent<SiteRuleOptions>]
}>()

const placeholder = `\
one,一
two,二
...
`

const state = reactive<SiteRuleOptions>({
  name: '新规则 ' + new Date().toLocaleDateString(),
  enabled: true,
  urlRegex: [RegExp.escape(document.location.href)],
  dictionaries: [],
  inlineDictionary: '',
  selector: {
    root: '',
    target: '',
    ignore: '',
  },
  style: defaultStyle,
})

if (props.rule) {
  state.name = props.rule.name
  state.enabled = props.rule.enabled
  state.urlRegex = props.rule.urlRegex.slice()
  state.dictionaries = props.rule.dictionaries.slice()
  state.inlineDictionary = props.rule.inlineDictionary
  state.selector = { ...props.rule.selector }
  state.style = props.rule.style
}

const { getDictionary } = useDictStore()
const selectedDicts = computed(() => {
  return state.dictionaries.map(it => getDictionary(it)).filter(it => it !== undefined)
})
function sortQuickDicts(event: Dictionary[]) {
  state.dictionaries = event.map(it => it.id)
}

function validate(state: Partial<SiteRuleOptions>): FormError[] {
  const errors = []
  // name
  if (!state.name) errors.push({ name: 'name', message: '名称不能为空' })
  if (state.urlRegex?.length === 0)
    errors.push({ name: 'urlRegex', message: '请指定至少一个匹配规则' })
  // inlinlineDictionaryine
  if (state.inlineDictionary) {
    const words = csvParseRows(state.inlineDictionary)
    for (let i = 0; i < words.length; i++) {
      const [key, value] = words[i]
      if (!key || !value) {
        errors.push({
          name: 'inlineDictionary',
          message: `第${i + 1}行 ${csvFormatRow(words[i])} 不符合"原文单词,译文单词"格式`,
        })
      }
    }
  }
  // selectors
  if (state.selector?.root && !isValidSelector(state.selector.root)) {
    errors.push({ name: 'selector.root', message: '该选择器无效' })
  }
  if (state.selector?.target && !isValidSelector(state.selector.target)) {
    errors.push({ name: 'selector.target', message: '该选择器无效' })
  }
  if (state.selector?.ignore && !isValidSelector(state.selector.ignore)) {
    errors.push({ name: 'selector.ignore', message: '该选择器无效' })
  }
  return errors
}

function onSubmit(event: FormSubmitEvent<SiteRuleOptions>) {
  emit('submit', event)
}

function onAddUrlRegex() {
  state.urlRegex.push(RegExp.escape(document.location.href))
}
function onDeleteUrlRegex(idx: number) {
  state.urlRegex.splice(idx, 1)
}
</script>

<template>
  <UForm class="relative flex flex-col" :state="state" :validate="validate" @submit="onSubmit">
    <div class="flex-1">
      <UFormField class="mb-4" label="规则名称" name="name" required>
        <UInput v-model="state.name" size="xl" variant="ghost" icon="i-lucide:pen-line" />
      </UFormField>
      <UFormField class="mb-4" label="启用/禁用" name="enabled">
        <USwitch v-model="state.enabled" />
      </UFormField>
      <UFormField class="mb-4" label="网址URL正则" name="urlRegex" required>
        <UFieldGroup v-for="(regex, idx) of state.urlRegex" class="w-full">
          <UButton class="whitespace-nowrap" variant="subtle"> /^ </UButton>
          <UInput
            class="flex-1"
            :modelValue="regex"
            @update:modelValue="state.urlRegex[idx] = $event"
          />
          <UButton variant="subtle"> / </UButton>
          <UButton icon="i-lucide:trash-2" color="error" @click="onDeleteUrlRegex(idx)"></UButton>
        </UFieldGroup>
        <UButton class="mt-2" block size="xs" @click="onAddUrlRegex">+</UButton>
      </UFormField>
      <UFormField class="mb-4" label="词典" name="dictionaries" description="词典优先级从低到高">
        <SortableDictionaryList
          :modelValue="selectedDicts"
          @update:modelValue="sortQuickDicts"
        ></SortableDictionaryList>
        <DictionarySelect v-model="state.dictionaries" class="mt-2" />
      </UFormField>
      <UFormField class="mb-4" label="额外词汇" name="inlineDictionary">
        <UTextarea
          v-model="state.inlineDictionary"
          class="w-full"
          :rows="10"
          :placeholder
        ></UTextarea>
      </UFormField>
      <UFormField
        class="mb-4"
        label="根选择器"
        description="将监听对应元素的变动并遍历子元素作为候选"
        name="selector.root"
      >
        <UInput v-model="state.selector.root" size="xl" placeholder="body" />
      </UFormField>
      <UFormField
        class="mb-4"
        label="翻译目标选择器"
        description="仅当候选元素符合该选择器规则时进行翻译"
        name="selector.target"
      >
        <UInput
          v-model="state.selector.target"
          size="xl"
          placeholder="h1, h2, h3, h4, h5, h6, li, p, dd, blockquote, figcaption, label, legend"
        />
      </UFormField>
      <UFormField
        class="mb-4"
        label="忽略选择器"
        description="遍历到该类元素将直接跳过子元素"
        name="selector.ignore"
      >
        <UInput
          v-model="state.selector.ignore"
          size="xl"
          placeholder="button, footer, pre, mark, nav"
        />
      </UFormField>
      <UFormField class="mb-4" label="样式" name="style">
        <UTextarea v-model="state.style" class="w-full" :rows="10"></UTextarea>
      </UFormField>
    </div>
    <div class="flex-initial top-full mt-auto mb-0 flex flex-row justify-between gap-2">
      <UButton block size="xl" variant="solid" type="submit"> 保存 </UButton>
      <UButton block size="xl" color="neutral" variant="soft" @click="emit('cancel')">
        取消
      </UButton>
    </div>
  </UForm>
</template>
