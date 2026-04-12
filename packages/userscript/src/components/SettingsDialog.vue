<script setup lang="ts">
import { DialogRoot, DialogContent } from './ui/Dialog';
import ConfigList from './config/ConfigList.vue';
import { ScrollAreaRoot, ScrollAreaContent } from './ui/ScrollArea';
import ConfigEditor from './config/ConfigEditor.vue';
import { ref } from 'vue';
import { loadRegistry, watchRegistryChange } from '../config';
// import ImportConfig from './config/ImportConfig.vue';

// Setting Dialog
const open = defineModel<boolean>('open', {
  default: false
})

// Config Editor Dialog
const openEditor = ref(false)
const editingConfigID = ref('')

const registry = ref(loadRegistry())

watchRegistryChange(registry)

function handleEdit(configID: string){
  editingConfigID.value = configID
  openEditor.value = true
}

// const openImport = ref(false)
// const importValue = ref<{
//   type: 'url' | 'text',
//   value: string,
// } | undefined>(undefined)

// function handleImport(){

//   if (!importValue?.value?.value) {
//     return
//   }

//   importValue.value = undefined
// }

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
              <!-- Config list header along with an importing button -->
              <div class="flex justify-between">
                <h3 class="mb-3 text-sm font-medium tracking-wider text-slate-500">
                  Config Management
                </h3>
                <!-- Import(WIP) Button -->
                <!-- <div class="justify-self-end">
                  <DialogRoot v-model:open="openImport">
                    <DialogTrigger>
                      <button class="hover:bg-gray/20 rounded border">
                        <div class="i-carbon:document-import"></div>
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <template #title>
                        Import New Config
                      </template>
                      <ImportConfig v-model="importValue"></ImportConfig>
                      <div class="flex justify-end gap-4">
                        <button @click="handleImport" class="p-2 border shadow-sm rounded bg-blue-400 hover:bg-blue-200">
                          Import
                        </button>
                        <button @click="openImport = false" class="p-2 border shadow-sm rounded bg-white hover:bg-gray-200">
                          Close
                        </button>
                      </div>
                    </DialogContent>
                  </DialogRoot>
                </div> -->
              </div>
              <!-- Scrollable config list -->
              <div class="rounded-lg border border-dashed border-slate-300 text-slate-400">
                <ScrollAreaRoot class="h-60">
                  <ScrollAreaContent class="">
                    <ConfigList class="p-8" @edit="handleEdit"></ConfigList>
                  </ScrollAreaContent>
                </ScrollAreaRoot>
              </div>
            </section>
            <!-- Nested dialog to edit selected config -->
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
