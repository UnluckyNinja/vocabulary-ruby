<script setup lang="ts">
import { computed, ref } from 'vue';

const emit = defineEmits<{
  'settings': []
  'toggle': []
}>();

const props = defineProps<{
  state: 'ready' | 'running' | 'reset'
}>()

const icon = computed(()=>{
  switch(props.state) {
    case 'ready': {
      return 'i-carbon:play'
    }
    case 'running': {
      return 'i-carbon:hourglass'
    }
    case 'reset': {
      return 'i-carbon:reset'
    }
  }
})

const isOpen = ref(false)
</script>

<template>
  <div
    class="fixed top-4 right-0 z-[2147483647] flex items-center justify-center transition-all duration-300 ease-in-out"
    :class="{ 'translate-x-0': isOpen, 'translate-x-full': !isOpen}"
    >
    <!-- Background Blur/Glass -->
    <div class="bg-blue-400/60 text-slate-700 backdrop-blur-md relative right-4 rounded-full h-12
      shadow-lg transition-all duration-300 overflow-clip"
      :class="{'translate-x-0 hover:-translate-x-2': !isOpen }">

      <!-- Icon -->
      <div class="relative flex items-center justify-around w-full h-full"
        :class="[isOpen ? '' : '']">
        <button class="text-2xl px-2 h-full hover:bg-white/10">
          <div :class="{ 'i-carbon:chevron-left relative right-2': !isOpen, 'i-carbon:chevron-right': isOpen }"
            @click="isOpen = !isOpen">
          </div>
        </button>
        <div class="w-0 h-60% border border-white/30"></div>
        <button class="text-2xl px-2 h-full hover:bg-white/10"
          @click="emit('toggle')"
          :disabled="state === 'running'">
          <div :class="[icon, state === 'running' ? 'animate-pulse cursor-wait' : '']"></div>
        </button>
        <div class="w-0 h-60% border border-white/30"></div>
        <button class="text-2xl px-2 h-full hover:bg-white/10"
          @click="emit('settings')">
          <div class="i-carbon:settings"></div>
        </button>
      </div>
    </div>
  </div>
</template>