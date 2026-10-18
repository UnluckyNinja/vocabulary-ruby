<script lang="ts" setup>
import { SiteRule } from '../composables/store'
const props = defineProps<{
  rules: SiteRule[]
}>()
</script>
<template>
  <div class="my-4">
    <template v-if="rules.length > 0">
      <template v-for="(rule, idx) in rules" :key="rule.id">
        <USeparator class="my-2" v-if="idx > 0"></USeparator>
        <!-- row item -->
        <div class="flex flex-row gap-1 items-center">
          <!-- change name -->
          <UInput class="flex-1" v-model="rule.name" variant="ghost"></UInput>
          <!-- timestamp -->
          <div class="flex-initial text-xs">
            {{ new Date(rule.createTime).toLocaleDateString() }}
          </div>
          <!-- action buttons -->
          <slot name="action" :rule="rule"></slot>
        </div>
      </template>
    </template>
    <template v-else>
      <UEmpty icon="i-lucide:book-dashed" title="未添加/找到站点规则"></UEmpty>
    </template>
  </div>
</template>

<style scoped></style>
