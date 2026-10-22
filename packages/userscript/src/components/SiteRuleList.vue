<script lang="ts" setup>
import { SiteRule, useSiteRuleStore } from '../composables/store'
const props = defineProps<{
  rules: SiteRule[]
}>()

const { updateSiteRule } = useSiteRuleStore()

function onChangeName(rule: SiteRule, newName: string) {
  updateSiteRule(rule.id, {
    name: newName,
  })
}

function onToggleRule(rule: SiteRule, value: boolean) {
  updateSiteRule(rule.id, {
    enabled: value,
  })
}
</script>
<template>
  <div class="my-4">
    <ul v-if="rules.length > 0">
      <template v-for="(rule, idx) in rules" :key="rule.id">
        <USeparator class="my-2" v-if="idx > 0"></USeparator>
        <!-- row item -->
        <li class="flex flex-row gap-1 items-center">
          <USwitch
            class="flex-none"
            :modelValue="rule.enabled"
            @update:modelValue="onToggleRule(rule, $event)"
          ></USwitch>
          <!-- change name -->
          <UInput
            class="flex-1"
            :modelValue="rule.name"
            @update:modelValue="onChangeName(rule, $event)"
            variant="ghost"
          ></UInput>
          <!-- timestamp -->
          <div class="flex-initial text-xs">
            {{ new Date(rule.createTime).toLocaleDateString() }}
          </div>
          <!-- action buttons -->
          <slot name="action" :rule="rule"></slot>
        </li>
      </template>
    </ul>
    <UEmpty v-else icon="i-lucide:book-dashed" title="未添加/找到站点规则"></UEmpty>
  </div>
</template>

<style scoped></style>
