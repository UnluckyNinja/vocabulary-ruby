<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormSubmitEvent } from '@nuxt/ui'
import {
  Dictionary,
  DictionaryOptions,
  SiteRule,
  SiteRuleOptions,
  useSettings,
  useSiteRuleStore,
} from '../composables/store'
import { useDictStore } from '../composables/store'
import { portalTarget } from '../shadowRoot'
import DictionaryList from './DictionaryList.vue'

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

const { showCreateDictionary, showCreateSiteRule } = useSettings()

const searchText = ref('')

const { addDictionary, listDictionaries, updateDictionary, deleteDictionary } = useDictStore()

const rawDictionaries = computed(() => {
  return [...listDictionaries()]
})
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
}
function onDeleteDictionary(dict: Dictionary) {
  deleteDictionary(dict.id)
}

const { addSiteRule, listSiteRules, updateSiteRule, deleteSiteRule } = useSiteRuleStore()
const rawRules = computed(() => {
  return [...listSiteRules()]
})
const rules = computed(() => {
  let rules = rawRules.value.slice()
  if (searchText.value) {
    rules = rules.filter(it => it.name.includes(searchText.value))
  }
  rules.sort((a, b) => a.createTime - b.createTime)
  return rules
})

function onCreateSiteRule(event: FormSubmitEvent<SiteRuleOptions>) {
  addSiteRule(event.data)
  showCreateSiteRule.value = false
}
function onEditSiteRule(rule: SiteRule, event: FormSubmitEvent<SiteRuleOptions>) {
  updateSiteRule(rule.id, event.data)
}
function onDeleteSiteRule(rule: SiteRule) {
  deleteSiteRule(rule.id)
}
</script>

<template>
  <UTabs :items="tabs" class="w-full h-full translate-0">
    <template #dictionary>
      <!-- 
        MARK: dictionary list
      -->
      <!-- search bar -->
      <div class="flex flex-row gap-2">
        <UInput
          class="flex-1"
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
        <ImportURLsButton>
          <UButton>批量导入</UButton>
        </ImportURLsButton>
      </div>
      <DictionaryList :dictionaries="dictionaries" :editable="true">
        <template #action="{ dict }">
          <!-- edit dictionary -->
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
                  @submit="(onEditDictionary(dict, $event), close())"
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
              <UButton @click="(onDeleteDictionary(dict), close)">确定删除</UButton>
              <UButton color="neutral" @click="close">返回</UButton>
            </template>
          </UModal>
        </template>
      </DictionaryList>
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
    <template #websites>
      <!-- 
        MARK: Website rule
      -->
      <!-- search bar, exact to above -->
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
      <SiteRuleList :rules="rules">
        <template #action="{ rule }">
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
                <FormSiteRule
                  :rule="rule"
                  @cancel="close"
                  @submit="(onEditSiteRule(rule, $event), close())"
                />
              </div>
            </template>
          </UModal>
          <!-- delete site rule -->
          <UModal
            :portal="portalTarget"
            :dismissible="false"
            :modal="true"
            :overlay="true"
            title="你确定吗？"
          >
            <UButton color="error" variant="outline" icon="i-lucide:trash-2"></UButton>
            <template #body>你即将删除 {{ rule.name }}， 该操作无法撤销。 </template>
            <template #footer="{ close }">
              <UButton @click="(onDeleteSiteRule(rule), close)">确定删除</UButton>
              <UButton color="neutral" @click="close">返回</UButton>
            </template>
          </UModal>
        </template>
      </SiteRuleList>
      <!-- 
        MARK: create rule
      -->
      <UModal
        v-model:open="showCreateSiteRule"
        :portal="portalTarget"
        :dismissible="false"
        :modal="true"
        :overlay="true"
        title="新建站点规则"
        scrollable
      >
        <UButton block>添加站点规则</UButton>
        <template #body>
          <div class="min-h-65dvh">
            <FormSiteRule @cancel="showCreateSiteRule = false" @submit="onCreateSiteRule" />
          </div>
        </template>
      </UModal>
    </template>
  </UTabs>
</template>
