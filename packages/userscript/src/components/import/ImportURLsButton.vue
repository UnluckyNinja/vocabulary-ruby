<script lang="ts" setup>
import { FormSubmitEvent } from '@nuxt/ui'
import { ref } from 'vue'
import { useDictStore } from '../../composables/store'
import { parseFilename } from 'ufo'
import { portalTarget } from '../../shadowRoot'
import { GM } from '$'

const toast = useToast()

const urls = ref('')
const open = ref(false)
const running = ref(false)
async function onSubmit(event: FormSubmitEvent<string>) {
  const { addDictionary, listDictionaries } = useDictStore()
  const urls = event.data.split(/\r?\n/)
  let success = 0
  let fail = 0
  let skip = 0
  for (const url of urls) {
    if (!url) {
      continue
    }
    const dict = listDictionaries().find(it => it.updateURL === url)
    if (dict) {
      toast.add({
        color: 'warning',
        title: `已有该地址的词典，名称为：${dict.name}, 创建于 ${new Date(dict.createTime).toLocaleString()}`,
        description: url,
      })
      ++skip
      continue
    }
    try {
      running.value = true
      const res = await GM.xmlHttpRequest({ url })
      const text = res.responseText
      addDictionary({
        name: parseFilename(url) ?? 'Imported ' + new Date().toLocaleString(),
        type: 'network',
        content: text,
        updateURL: url,
        filter: {
          minLength: 0,
        },
      })
    } catch (e) {
      console.error(e)
      toast.add({
        color: 'error',
        title: '添加失败，按F12查看报错，请检查网络并核对地址内容后重试',
        description: url,
      })
      ++fail
      continue
    }
    ++success
  }
  toast.add({
    color: fail === 0 ? 'success' : success === 0 ? 'error' : 'warning',
    title: fail === 0 ? '添加成功' : success === 0 ? '添加失败' : '添加完毕',
    description: `成功 ${success}, 失败 ${fail}`,
  })
  running.value = false
  if (fail === 0) {
    open.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :portal="portalTarget" :modal="true" :overlay="true" title="批量导入">
    <slot></slot>
    <template #body="{ close }">
      <UForm :state="urls" @submit="onSubmit">
        <UFormField
          class="mb-4"
          label="地址列表"
          name="urls"
          description="每行一个地址，仅支持CSV格式"
        >
          <UTextarea v-model="urls" class="w-full" :rows="10"></UTextarea>
        </UFormField>
        <div class="flex-initial top-full mt-auto mb-0 flex flex-row justify-between gap-2">
          <UButton block size="xl" variant="solid" type="submit" :loading="running"> 提交 </UButton>
          <UButton block size="xl" color="neutral" variant="soft" @click="close"> 取消 </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<style scoped></style>
