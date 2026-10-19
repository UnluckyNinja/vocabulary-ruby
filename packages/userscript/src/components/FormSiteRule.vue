<script lang="ts" setup>
import { FormError, FormSubmitEvent } from '@nuxt/ui'
import { computed, reactive } from 'vue'
import { SiteRule, SiteRuleOptions, useDictStore } from '../composables/store'
import { isValidSelector } from '../utils'

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
  style: '',
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
      const valueA = state.dictionaries.includes(a.value) ? 0 : 1
      const valueB = state.dictionaries.includes(b.value) ? 0 : 1
      return valueA - valueB
    })
})
const selectedDicts = computed(() => {
  return dictItems.value.filter(it => state.dictionaries.includes(it.value))
})

const regex = /^(?:.+),(?:.+)$/
function validate(state: Partial<SiteRuleOptions>): FormError[] {
  const errors = []
  // name
  if (!state.name) errors.push({ name: 'name', message: '名称不能为空' })
  // inlinlineDictionaryine
  if (state.inlineDictionary) {
    const words = state.inlineDictionary.split(/\r?\n/)
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      if (!regex.test(word)) {
        errors.push({
          name: 'inlineDictionary',
          message: `第${i + 1}行 ${word} 不符合"原文单词,译文单词"格式`,
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
function onSelectDictionaries(
  value: {
    label: string
    value: string
  }[],
) {
  state.dictionaries = value.map(it => it.value)
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
      <UFormField class="mb-4" label="规则名称" name="name">
        <UInput v-model="state.name" size="xl" variant="ghost" icon="i-lucide:pen-line" />
      </UFormField>
      <UFormField class="mb-4" label="启用/禁用" name="enabled">
        <USwitch v-model="state.enabled" />
      </UFormField>
      <UFormField class="mb-4" label="网址URL正则" name="urlRegex">
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
      <UFormField class="mb-4" label="词典" name="dictionaries">
        <UListbox
          class="max-h-sm"
          multiple
          filter
          :modelValue="selectedDicts"
          @update:modelValue="onSelectDictionaries"
          :items="dictItems"
        ></UListbox>
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
