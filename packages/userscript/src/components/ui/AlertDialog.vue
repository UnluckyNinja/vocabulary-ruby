<script setup lang="ts">
import { AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogTitle, AlertDialogCancel, AlertDialogAction, AlertDialogDescription } from 'reka-ui';
import { ScrollAreaRoot, ScrollAreaContent } from './ScrollArea';
import { portalTarget } from '../../shadowRoot';

</script>

<template>
  <AlertDialogPortal :to="portalTarget">
    <AlertDialogOverlay
      class="fixed inset-0 z-99999 bg-black/40 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <AlertDialogContent
      class="fixed left-1/2 top-1/2 z-99999 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-0 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
    >
      <!-- Header -->
      <header class="flex items-center justify-between border-b px-6 py-4">
        <AlertDialogTitle class="text-xl font-semibold text-slate-800">
          <slot name="title">Are you sure?</slot>
        </AlertDialogTitle>
        <AlertDialogDescription class="text-xl font-semibold text-slate-800">
          <slot name="description"></slot>
        </AlertDialogDescription>
      </header>

      <!-- Body -->
      <ScrollAreaRoot class="max-h-40dvh flex flex-col text-lg">
        <ScrollAreaContent>
          <slot></slot>
        </ScrollAreaContent>
      </ScrollAreaRoot>

      <!-- Footer -->
      <footer class="flex items-center justify-end gap-3 border-t bg-slate-50/50 px-6 py-4">
        <slot name="footer">
          <AlertDialogCancel
            class="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <slot name="cancel">Cancel</slot>
          </AlertDialogCancel>
          <AlertDialogAction
            class="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <slot name="action">Confirm</slot>
          </AlertDialogAction>
        </slot>
      </footer>
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
