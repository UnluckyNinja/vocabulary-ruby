import { createGlobalState } from '@vueuse/core';
import { reactive } from 'vue';

export type Toast = Partial<{
  type: 'info' | 'error' | 'warning' | 'default' | 'success'
  title: string
  description: string
  icon: string
  /**
   * in ms
   */
  duration: number
  actionText: string
  dismissible: boolean
}>

export interface ToastContext {
  onAction(callback: () => void): void
  withdraw(): void
}

export interface ToastHooks {
  action: () => void
}

export const useToastStore = createGlobalState(()=> {
  const toasts = reactive(new Map<symbol, Partial<Toast>>())
  const hooks = new WeakMap<symbol, Partial<ToastHooks>>()

  function createToast(toastFactory: (context: ToastContext) => Partial<Toast>){

    const symbol = Symbol()

    function withdraw(){
      if (!toasts.has(symbol)) {
        return
      }
      toasts.delete(symbol)
      hooks.delete(symbol)
    }

    function onAction(callback: ()=>void) {
      hooks.set(symbol, { action: callback })
    }

    const toast = toastFactory({ onAction, withdraw })

    // duration is automatically handled by ToastRoot component.

    toasts.set(symbol, toast)
  }

  return {
    createToast,
    toasts,
    hooks
  }
})
