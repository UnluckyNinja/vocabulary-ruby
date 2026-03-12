<script setup lang="ts">
import { DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'reka-ui';
import { ScrollAreaRoot, ScrollAreaContent } from './ScrollArea';
import { portalTarget } from '../../shadowRoot';

</script>

<template>
  <DialogPortal :to="portalTarget">
    <DialogOverlay
      class="fixed inset-0 z-99999 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogContent
      class="fixed left-1/2 top-1/2 z-99999 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-0 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
    >
      <!-- Header -->
      <header class="flex items-center justify-between border-b px-6 py-4">
        <DialogTitle class="text-xl font-semibold text-slate-800">
          <slot name="title">Dialog</slot>
        </DialogTitle>
        <DialogClose
          class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none"
        >
          <div class="i-carbon:close h-6 w-6"></div>
        </DialogClose>
      </header>

      <!-- Body -->
      <ScrollAreaRoot class="max-h-50dvh flex flex-col">
        <ScrollAreaContent>
          <slot></slot>
        </ScrollAreaContent>
      </ScrollAreaRoot>

      <!-- Footer -->
      <footer class="flex items-center justify-end gap-3 border-t bg-slate-50/50 px-6 py-4">
        <slot name="footer">
          <DialogClose
            class="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Close
          </DialogClose>
        </slot>
      </footer>
    </DialogContent>
  </DialogPortal>
</template>
