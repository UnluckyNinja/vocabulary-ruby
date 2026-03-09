<script setup lang="ts">
import { ref, useModel } from 'vue';
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'reka-ui';
import ConfigList from './ConfigList.vue';
import ConfigEditor from './ConfigEditor.vue';
import { ConfigInfo } from '../utils/configType';

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'reload-dictionary'): void
}>();

const open = defineModel<boolean>('open', {
  default: false
})


const registry = ref<ConfigInfo[]>([]);
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogOverlay class="fixed inset-0 z-9998 bg-black/50 backdrop-blur-sm" />
    <DialogContent class="fixed z-9999 top-1/2 left-1/2 -translate-1/2">
      <DialogTitle>Settings</DialogTitle>
      <DialogClose>
        <div class="i-carbon:close"></div>
      </DialogClose>
    </DialogContent>
  </DialogRoot>
</template>
