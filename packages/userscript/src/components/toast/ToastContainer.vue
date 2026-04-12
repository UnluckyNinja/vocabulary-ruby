<script setup lang="ts">
import { ToastAction, ToastClose, ToastDescription, ToastRoot, ToastTitle } from 'reka-ui'
import { useToastStore } from '../../composables/useToastStore';

const { toasts, hooks } = useToastStore()

function getAction(id: symbol) {
  return hooks.get(id)
}

function onOpenStateUpdate(symbol: symbol, value: boolean) {
  if (!value) {
    setTimeout(()=>{
      toasts.delete(symbol)
      hooks.delete(symbol)
    }, 5000)
  }
}

</script>

<template>
  <ToastRoot
    v-for="[symbol, toast] in toasts"
    :duration="toast.duration"
    :key="symbol"
    class="bg-white rounded-lg shadow-sm border p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center transition-all data-[state=open]:animate-[slide-in-right_150ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[fade-out_5000ms_ease-in] data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:(transition-transform-200 ease-out) data-[swipe=end]:animate-[slide-out-right_150ms_ease-out]"
    @update:open="(value)=>onOpenStateUpdate(symbol, value)"
    >
    <template #default="{duration, remaining}">
      <div :class="[toast.icon]"></div>
      <ToastTitle v-if="toast.title">
        {{ toast.title }}
      </ToastTitle>
      <ToastDescription v-if="toast.description">
        {{ toast.description }}
      </ToastDescription>
      <ToastAction v-if="getAction(symbol)?.action" @click="getAction(symbol)?.action" 
        altText="toast.actionText ?? 'Toast Action'">{{ toast.actionText }}</ToastAction>
      <ToastClose v-if="toast.dismissible">Dismiss</ToastClose>
      <div class="w-full h-1 bg-green transform-origin-left-center" :style="{transform: `scaleX(${remaining/duration})`}"></div>
    </template>
  </ToastRoot>
</template>

<style>
</style>