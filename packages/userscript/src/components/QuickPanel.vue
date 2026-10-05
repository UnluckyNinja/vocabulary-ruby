<script lang="ts" setup></script>

<template>
  <UCard>
    <USkeleton class="size-28" />
    <template #footer>
      <div class="flex flex-row items-stretch space-x-lg">
        <UButton class="flex-1" size="lg">启用</UButton>
        <UButton class="flex-none" size="lg">
          <div class="i-lucide:settings"></div>
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<style scoped></style>
