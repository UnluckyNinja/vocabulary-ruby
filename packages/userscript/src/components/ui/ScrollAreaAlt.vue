<script setup lang="ts">
import {
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'reka-ui'

</script>

<template>
  <ScrollAreaViewport v-bind="$attrs" class="h-full w-full rounded-[inherit]">
    <slot />
  </ScrollAreaViewport>
  <ScrollAreaScrollbar
    class="flex select-none touch-none p-0.5 bg-slate-100 transition-colors duration-[160ms] ease-out hover:bg-slate-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
    orientation="vertical"
  >
    <ScrollAreaThumb
      class="flex-1 bg-slate-300 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]"
    />
  </ScrollAreaScrollbar>
  <ScrollAreaScrollbar
    class="flex select-none touch-none p-0.5 bg-slate-100 transition-colors duration-[160ms] ease-out hover:bg-slate-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
    orientation="horizontal"
  >
    <ScrollAreaThumb
      class="flex-1 bg-slate-300 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]"
    />
  </ScrollAreaScrollbar>
  <ScrollAreaCorner class="bg-black/5" />
</template>
