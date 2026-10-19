<script lang="ts" setup>
import { FormError, FormSubmitEvent, RadioGroupItem } from '@nuxt/ui'
import { computed, reactive, ref } from 'vue'
import { GM } from '$'
import { Dictionary, useDictStore, type DictionaryOptions } from '../composables/store'

const props = defineProps<{
  dict?: Dictionary
}>()

const emit = defineEmits<{
  cancel: []
  submit: [FormSubmitEvent<Schema>]
}>()

const items = ref<RadioGroupItem[]>([
  {
    label: '本地',
    value: 'local',
  },
  {
    label: '网络',
    value: 'network',
  },
])

const state = reactive<DictionaryOptions>({
  name: '新词典 ' + new Date().toLocaleDateString(),
  type: 'local',
  updateURL: '',
  content: '',
} as DictionaryOptions)

const { getDictionaryContent } = useDictStore()

if (props.dict) {
  state.name = props.dict.name
  state.type = props.dict.type
  state.updateURL = props.dict.updateURL
  state.content = getDictionaryContent(props.dict.id).value
}

interface Schema {
  name: string
  type: 'local' | 'network'
  updateURL: string
  content: string
}

const placeholder = computed(() => {
  if (state.type === 'network') {
    return '请点击链接右侧按钮下载词典'
  }
  return `\
one,一
two,二
...
`
})

const regex = /^(?:.+),(?:.+)$/
function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.name) errors.push({ name: 'name', message: '内容不能为空' })
  if (!state.content) errors.push({ name: 'content', message: '内容不能为空' })
  if (state.content) {
    const words = state.content.trim().split(/\r?\n/)
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      if (!regex.exec(word)) {
        errors.push({
          name: 'content',
          message: `第${i + 1}行 ${word} 不符合"原文单词,译文单词"格式`,
        })
      }
    }
  }
  return errors
}

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('submit', event)
}

const fetching = ref(false)
const toasts = useToast()
async function fetchContent() {
  if (fetching.value) {
    return
  }
  if (state.type !== 'network') {
    return
  }
  const url = state.updateURL
  try {
    fetching.value = true
    const res = await GM.xmlHttpRequest({ url })
    state.content = res.responseText
    fetching.value = false
  } catch (error) {
    console.error(error)
    toasts.add({
      title: '网络请求出错，按F12在控制台中查看',
      description: '请检查地址或手动获取并保存为本地词典',
    })
  }
}
</script>

<template>
  <UForm class="relative flex flex-col" :state="state" :validate="validate" @submit="onSubmit">
    <div class="flex-1">
      <UFormField class="mb-4" label="词典名称" name="name">
        <UInput v-model="state.name" size="xl" variant="ghost" icon="i-lucide:pen-line" />
      </UFormField>
      <UFormField class="mb-4" label="词典类型" name="type">
        <URadioGroup
          class="select-none"
          orientation="horizontal"
          variant="card"
          v-model="state.type"
          default-value="local"
          size="md"
          :items="items"
          :ui="{ item: 'flex-1 items-center' }"
        />
      </UFormField>
      <UFormField class="mb-4" v-show="state.type === 'network'" label="更新地址" name="updateURL">
        <UFieldGroup class="w-full">
          <UInput
            class="w-full"
            v-model="state.updateURL"
            icon="i-lucide:link"
            @keypress.enter="fetchContent"
          />
          <UButton size="lg" @click="fetchContent" :disabled="fetching">
            <UIcon
              :class="{ 'animate-spin': fetching }"
              :name="fetching ? 'i-lucide:loader-circle' : 'i-lucide:cloud-download'"
            />
          </UButton>
        </UFieldGroup>
      </UFormField>
      <UFormField class="mb-4" label="词汇列表" name="content">
        <UTextarea
          v-model="state.content"
          class="w-full"
          :rows="10"
          :placeholder="placeholder"
        ></UTextarea>
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

<style scoped></style>
