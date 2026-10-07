<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormSubmitEvent } from '@nuxt/ui'
import { Dictionary, DictionaryOptions, useSettings } from '../composables/store'
import { useDictStore } from '../composables/store'
import { portalTarget } from '../shadowRoot'

const tabs = [
  {
    label: '词典管理',
    icon: 'i-lucide:book-a',
    slot: 'dictionary',
  },
  {
    label: '网站设置',
    icon: 'i-lucide:layout-list',
    slot: 'websites',
  },
]

const { showCreateDictionary, showCreateWebsiteRule } = useSettings()
const {
  addDictionary,
  listDictionaries,
  updateDictionary,
  updateDictionaryContent,
  deleteDictionary,
} = useDictStore()

const rawDictionaries = computed(() => {
  return [...listDictionaries()]
})
const searchText = ref('')
const dictionaries = computed(() => {
  let dicts = rawDictionaries.value.slice()
  if (searchText.value) {
    dicts = dicts.filter(it => it.name.includes(searchText.value))
  }
  dicts.sort((a, b) => a.createTime - b.createTime)
  return dicts
})

function onCreateDictionary(event: FormSubmitEvent<DictionaryOptions>) {
  addDictionary(event.data)
  showCreateDictionary.value = false
}
function onEditDictionary(dict: Dictionary, event: FormSubmitEvent<DictionaryOptions>) {
  updateDictionary(dict.id, event.data)
  updateDictionaryContent(dict.id, event.data.content)
}
function onDeleteDictionary(dict: Dictionary) {
  deleteDictionary(dict.id)
}
</script>

<template>
  <UTabs :items="tabs" class="w-full h-full translate-0">
    <template #dictionary>
      <!-- 
        MARK: dictionary list
      -->
      <!-- search bar -->
      <UInput
        class="w-full"
        icon="i-lucide:search"
        size="md"
        variant="outline"
        placeholder="筛选列表"
        v-model="searchText"
      >
        <template v-if="searchText?.length" #trailing>
          <UButton
            class="cursor-pointer"
            color="neutral"
            variant="link"
            icon="i-lucide-circle-x"
            aria-label="取消过滤"
            @click="searchText = ''"
          />
        </template>
      </UInput>
      <!-- list -->
      <div v-if="dictionaries.length > 0" class="my-4">
        <template v-for="(dict, idx) in dictionaries" :key="dict.id">
          <USeparator class="my-2" v-if="idx > 0"></USeparator>
          <!-- row item -->
          <div class="flex flex-row gap-1 items-center">
            <!-- change name -->
            <UInput class="flex-1" v-model="dict.name" variant="ghost"></UInput>
            <!-- timestamp -->
            <div class="flex-initial text-xs">
              {{ new Date(dict.createTime).toLocaleDateString() }} 更新
            </div>
            <!-- edit -->
            <UModal
              :portal="portalTarget"
              :dismissible="false"
              :modal="true"
              :overlay="true"
              title="编辑词典"
              scrollable
            >
              <UButton class="flex-none self-stretch" color="secondary">编辑</UButton>
              <template #body="{ close }">
                <div class="min-h-65dvh">
                  <FormDictionary
                    :dict="dict"
                    @cancel="close"
                    @submit="
                      onEditDictionary(dict, $event)
                      close()
                    "
                  />
                </div>
              </template>
            </UModal>
            <!-- delete dictionary -->
            <UModal
              :portal="portalTarget"
              :dismissible="false"
              :modal="true"
              :overlay="true"
              title="你确定吗？"
            >
              <UButton color="error" variant="outline" icon="i-lucide:trash-2"></UButton>
              <template #body>你即将删除 {{ dict.name }}， 该操作无法撤销。 </template>
              <template #footer="{ close }">
                <UButton
                  @click="
                    onDeleteDictionary(dict)
                    close
                  "
                  >确定删除</UButton
                >
                <UButton color="neutral" @click="close">返回</UButton>
              </template>
            </UModal>
          </div>
        </template>
      </div>
      <div v-else class="my-4">
        <UEmpty icon="i-lucide:book-dashed" title="未添加/找到词典"></UEmpty>
      </div>
      <!-- 
        MARK: create dictionary
      -->
      <UModal
        v-model:open="showCreateDictionary"
        :portal="portalTarget"
        :dismissible="false"
        :modal="true"
        :overlay="true"
        title="新建词典"
        scrollable
      >
        <UButton block>添加词典</UButton>
        <template #body>
          <div class="min-h-65dvh">
            <FormDictionary @cancel="showCreateDictionary = false" @submit="onCreateDictionary" />
          </div>
        </template>
      </UModal>
    </template>
    <template #websites> </template>
  </UTabs>
</template>
