<script lang="ts" setup>
import { useSettings } from '../composables/store'

const { showSettings } = useSettings()
function clickSettings() {
  showSettings.value = true
}
</script>

<template>
  <UCard>
    <div>使用词典</div>
    <div>样式规则</div>
    <USkeleton class="size-28" />
    <template #footer>
      <div class="flex flex-row items-stretch space-x-lg">
        <UButton class="flex-1" size="lg">启用</UButton>
        <UButton class="flex-none" color="secondary" size="lg" @click="clickSettings">
          <div class="i-lucide:settings"></div>
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<style scoped></style>
