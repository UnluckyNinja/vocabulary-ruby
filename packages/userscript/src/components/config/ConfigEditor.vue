<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { loadConfig, watchConfigChange } from '../../config';
import { EditableArea, EditableInput, EditablePreview, EditableRoot, SwitchRoot, SwitchThumb, ToastAction, ToastClose, ToastDescription, ToastRoot, ToastTitle } from 'reka-ui';
import DictionaryList from './DictionaryList.vue';
import { addDictionaryToConfig } from '../../config/dict';
import { processSources, saveDictionary } from '../../engine/loader';


// const config = defineModel({
//   required: true
// })

const props = defineProps<{
  configID: string
}>()

const config = ref(loadConfig(props.configID))
watch(()=>props.configID, (newVal)=>{
  config.value = loadConfig(newVal)
})
watchConfigChange(config)

const isRemote = computed(()=>{
  return config.value?.mode === 'remote'
})

function handleAdding(){
  if (!config.value) return
  addDictionaryToConfig(config.value.id)
}

/* Dictionary auto-save */

const dictChanged = ref(false)
const failed = ref<string[]>([])
const failedPretty = ref<string[]>([])

const toastOpen = ref(false)
const timeoutRef = ref<number | undefined>(undefined)
const statusTitle = ref('')
const statusMessage = ref('')

async function saveDictionaryCache(){
  if (!dictChanged.value) return
  if (!config.value) return
  clearTimeout(timeoutRef.value)
  statusTitle.value = 'Processing dictionaries...'
  statusMessage.value = 'Please wait until it\'s done.'
  toastOpen.value = true
  const result = await processSources([...config.value.remoteDictionaries, ...config.value.localDictionaries])
  saveDictionary(props.configID, result.dicts)
  failed.value = result.failed.map(it=>it.id)
  failedPretty.value = result.failed.slice(0,5).map(it=>`${it.name}, ID: ${it.id.slice(0,6)}...`)
  dictChanged.value = false
  statusTitle.value = 'Done! ' + failed.value.length + ' dictionaries failed to load.'
  statusMessage.value = `${failed.value.length > 0 ? failedPretty.value.join('\n') : 'All succeeded.'}\n`
    + `${failed.value.length > failedPretty.value.length ? `and ${failed.value.length - failedPretty.value.length} more...\n` :''}`
    + `This toast will auto-close after 5s.`
  timeoutRef.value = setTimeout(()=>{
    toastOpen.value = false
  }, 5000)
}


onBeforeUnmount(()=>{
  console.debug('Reload dictionaries')
  if (dictChanged.value) {
    saveDictionaryCache()
  }
})
</script>

<template>
  <div v-if="config" class="m-8 flex flex-col gap-4 text-slate-700 dark:text-slate-200">
    <header>
      <h3 class="text-xl">
        <div class="text-xs">Name</div>
        <EditableRoot v-model="config.name">
          <EditableArea>
            <EditablePreview class="inline-block p-2 pl-1 rounded hover:bg-slate/10" />
            <EditableInput class="p-2 pl-1 bg-slate/10" />
          </EditableArea>
        </EditableRoot>
      </h3>
      <div class="text-xs text-gray">
        ID: {{ config.id }}
      </div>
    </header>
    <section>
      <div class="text-xs">Mode</div>
      <div class="flex items-center gap-2">
        <span>
          Local
        </span>
        <SwitchRoot v-model="config.mode" trueValue="remote" falseValue="local"
          class="inline-block w-[32px] h-[20px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:shadow-stone-800">
          <SwitchThumb
            class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full" />
        </SwitchRoot>
        <span>
          Remote
        </span>
      </div>
    </section>
    <section v-if="isRemote">
      <span>Update URL</span>
      <EditableRoot v-model="config.remoteUrl">
        <EditableArea>
          <EditablePreview class="inline-block w-full p-2 rounded bg-slate/10" />
          <EditableInput class="p-2 w-full bg-slate/10" />
        </EditableArea>
      </EditableRoot>
    </section>
    <section v-if="isRemote">
      <span>Remote Regexes (Read Only)</span>
      <textarea class="block p-1 w-full min-h-20 field-sizing-content max-h-60 rounded bg-slate/10" name="preview remote regexes" 
      :value="config.remoteSiteRegexes" readonly></textarea>
    </section>
    <section>
      <span>URL Regexes Overrides (Always matched with "^")</span>
      <textarea class="block p-1 w-full min-h-20 field-sizing-content max-h-60 rounded bg-slate/10" name="edit local dictionaries" v-model="config.localSiteRegexes"></textarea>
    </section>
    <section v-if="isRemote">
      <span>Builtin Dictionaries</span>
      <div v-if="config.remoteDictionaries.length === 0">
        <div class="select-none h-8 grid place-content-center bg-slate/10 text-gray rounded-lg">Empty</div>
      </div>
      <DictionaryList :configID="configID" v-else v-model="config.remoteDictionaries"></DictionaryList>
    </section>
    <section>
      <span>Local Dictionary Overrides</span>
      <DictionaryList @dictChanged="dictChanged = true" :configID="configID" v-model="config.localDictionaries"></DictionaryList>
      <button
        @click="handleAdding"
        class="my-2 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-500 hover:text-blue-500 hover:border-blue-500 transition-colors flex items-center justify-center gap-1"
      >
        <div class="i-carbon-add text-lg"></div>
        Add new dictionary
      </button>
    </section>
    <ToastRoot v-model:open="toastOpen">
      <ToastTitle>
        {{ statusTitle }}
      </ToastTitle>
      <ToastDescription>
        {{ statusMessage }}
        </ToastDescription>
      <!-- <ToastAction  /> -->
      <!-- <ToastClose /> -->
    </ToastRoot>
  </div>
</template>

<style scoped>

</style>