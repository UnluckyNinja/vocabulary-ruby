<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { addConfigToRegistry, loadRegistry, saveConfig, watchRegistryChange } from '../../config';
import ConfigItem from './ConfigItem.vue';
import { DialogContent, DialogRoot } from '../ui/Dialog';
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import { saveDictionary } from '../../engine/loader';

const emit = defineEmits<{
  edit: [string]
}>()

const registry = ref(loadRegistry())
watchRegistryChange(registry)

const openDeleteConfirm = ref(false)
const selectedConfigDeleteID = ref('')
const selectedConfigDelete = computed(()=>{
  if (!selectedConfigDeleteID.value) return undefined
  return registry.value.find(it=>it.id === selectedConfigDeleteID.value)
})
function onSelectDelete(configID: string){
  selectedConfigDeleteID.value = configID
  openDeleteConfirm.value = true
}
function handleDeleting(){
  const index = registry.value.findIndex(it=>it.id === selectedConfigDeleteID.value)
  registry.value.splice(index, 1)
  saveConfig(selectedConfigDeleteID.value, undefined)
  saveDictionary(selectedConfigDeleteID.value, undefined)
  openDeleteConfirm.value = false
}
watch(openDeleteConfirm, (newVal)=>{
  if (!newVal) {
    selectedConfigDeleteID.value = ''
  }
})
function handleAdding() {
  addConfigToRegistry()
}
</script>

<template>
  <div class="flex flex-col">
    <ConfigItem v-for="config in registry" :key="config.id" v-model:name="config.name" @delete="onSelectDelete(config.id)">
      <template #control>
        <SwitchRoot v-model="config.enabled"
          class="inline-block w-[32px] h-[20px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:shadow-stone-800">
          <SwitchThumb
            class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full" />
        </SwitchRoot>
        <button
          @click="emit('edit', config.id)"
          title="Edit settings"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90"
        >
          <div class="i-carbon:settings h-4 w-4"></div>
        </button>
      </template>
    </ConfigItem>
    <button
      @click="handleAdding"
      class="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-500 hover:text-blue-500 hover:border-blue-500 transition-colors flex items-center justify-center gap-1"
    >
      <div class="i-carbon-add text-lg"></div>
      Add new config
    </button>
    <DialogRoot v-model:open="openDeleteConfirm">
      <DialogContent>
        <template #title>
          <div class="font-extrabold">
            Deleting config
          </div>
        </template>
        <div class="p-8 text-slate-800">
          You are about to delete config "{{ selectedConfigDelete?.name }}".<br>
          This action cannot be undone. Are you sure?
        </div>
        <template #footer>
          <button @click="handleDeleting" class="bg-red-600 hover:bg-red-400 text-slate-100 cursor-pointer p-2 rounded">
            Delete
          </button>
          <button @click="openDeleteConfirm = false" class="hover:bg-slate-200 text-slate-800 cursor-pointer p-2 rounded">
            Cancel
          </button>
        </template>
      </DialogContent>
    </DialogRoot>
  </div>
</template>

<style scoped>

</style>