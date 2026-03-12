<script setup lang="ts">
import { DialogRoot, DialogContent } from './ui/Dialog';
import ConfigList from './config/ConfigList.vue';
import { ScrollAreaRoot, ScrollAreaContent } from './ui/ScrollArea';
import ConfigEditor from './config/ConfigEditor.vue';
import { ref } from 'vue';
import { loadRegistry, watchRegistryChange } from '../config';

const open = defineModel<boolean>('open', {
  default: false
})

const openEditor = ref(false)
const editingConfigID = ref('')

const registry = ref(loadRegistry())

watchRegistryChange(registry)

function handleEdit(configID: string){
  editingConfigID.value = configID
  openEditor.value = true
}

</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogContent>
      <template #title>
        Settings
      </template>
      <!-- Body -->
      <div class="max-h-[60vh]">
        <main class="px-6 py-4">
          <div class="space-y-6">
            <section>
              <h3 class="mb-3 text-sm font-medium tracking-wider text-slate-500">
                Config Management
              </h3>
              <!-- Future content: ConfigList, etc. -->
              <div class="rounded-lg border border-dashed border-slate-300 text-slate-400">
                <ScrollAreaRoot class="h-60">
                  <ScrollAreaContent class="">
                    <ConfigList class="p-8" @edit="handleEdit"></ConfigList>
                  </ScrollAreaContent>
                </ScrollAreaRoot>
              </div>
            </section>
            <DialogRoot v-model:open="openEditor">
              <DialogContent >
                <template #title>
                  Edit Config
                </template>
                <ConfigEditor v-if="editingConfigID" :configID="editingConfigID"></ConfigEditor>
              </DialogContent>
            </DialogRoot>
          </div>
        </main>
      </div>
    </DialogContent>
  </DialogRoot>
</template>
