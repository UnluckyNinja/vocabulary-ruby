<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'open-settings'): void
}>();

const isHovered = ref(false);
</script>

<template>
  <div
    class="fixed top-4 right-4 z-[2147483647] flex items-center justify-center transition-all duration-300 ease-in-out cursor-pointer group"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="emit('open-settings')"
  >
    <!-- Background Blur/Glass -->
    <div 
      class="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30 transition-all duration-300"
      :class="{ 'w-12 h-12': !isHovered, 'w-32 h-12': isHovered }"
    ></div>

    <!-- Icon -->
    <div class="relative flex items-center justify-center w-full h-full px-3">
      <div class="i-carbon-translate text-xl text-gray-800 dark:text-white transition-opacity duration-300" :class="{ 'opacity-100': !isHovered, 'opacity-0': isHovered }"></div>
      
      <!-- Expanded Text -->
      <span 
        class="absolute text-sm font-medium text-gray-800 dark:text-white whitespace-nowrap opacity-0 transition-opacity duration-300"
        :class="{ 'opacity-100 delay-100': isHovered }"
      >
        Settings
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Ensure icon works if using UnoCSS icons preset */
</style>
