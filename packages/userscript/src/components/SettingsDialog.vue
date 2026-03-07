<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'reka-ui';
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import { DictionaryLoader } from '../engine/loader';
import { CompressedStorage } from '../utils/storage';

const props = defineProps<{
  open: boolean
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'reload-dictionary'): void
  (e: 'toggle-enable', value: boolean): void
}>();

const enabled = ref(true);
const urls = ref<string[]>([]);
const newUrl = ref('');
const loading = ref(false);
const statusMessage = ref('');

// Load initial settings
onMounted(async () => {
  const storedUrls = await CompressedStorage.get<string[]>('vocabulary_ruby_urls');
  if (storedUrls) {
    urls.value = storedUrls;
  }
  
  const storedEnabled = await CompressedStorage.get<boolean>('vocabulary_ruby_enabled');
  if (storedEnabled !== null) {
    enabled.value = storedEnabled;
  }
});

const toggleEnable = async (val: boolean) => {
  enabled.value = val;
  await CompressedStorage.set('vocabulary_ruby_enabled', val);
  emit('toggle-enable', val);
};

const addUrl = async () => {
  if (newUrl.value && !urls.value.includes(newUrl.value)) {
    urls.value.push(newUrl.value);
    await CompressedStorage.set('vocabulary_ruby_urls', urls.value);
    newUrl.value = '';
  }
};

const removeUrl = async (index: number) => {
  urls.value.splice(index, 1);
  await CompressedStorage.set('vocabulary_ruby_urls', urls.value);
};

const reload = async () => {
  loading.value = true;
  statusMessage.value = 'Fetching dictionaries...';
  try {
    await DictionaryLoader.processDictionaries(urls.value);
    statusMessage.value = 'Dictionary updated successfully!';
    emit('reload-dictionary');
  } catch (e) {
    statusMessage.value = 'Failed to update dictionary.';
    console.error(e);
  } finally {
    loading.value = false;
    setTimeout(() => {
      if (statusMessage.value === 'Dictionary updated successfully!') {
        statusMessage.value = '';
      }
    }, 3000);
  }
};
</script>

<template>
  <DialogRoot :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[2147483648] bg-black/50 backdrop-blur-sm" />
      <DialogContent class="fixed z-[2147483649] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 focus:outline-none">
        
        <div class="flex justify-between items-center mb-4">
          <DialogTitle class="text-lg font-bold text-gray-900 dark:text-white">
            Vocabulary Ruby Settings
          </DialogTitle>
          <DialogClose class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <div class="i-carbon-close text-xl"></div>
          </DialogClose>
        </div>

        <DialogDescription class="text-sm text-gray-500 mb-6">
          Manage your dictionary sources and plugin behavior.
        </DialogDescription>

        <!-- Enable Toggle -->
        <div class="flex items-center justify-between mb-6">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Enable Plugin</label>
          <SwitchRoot
            v-model:checked="enabled"
            @update:checked="toggleEnable"
            class="w-[42px] h-[25px] bg-gray-200 rounded-full relative shadow-inner focus:shadow-black transition-colors data-[state=checked]:bg-green-500 outline-none cursor-default"
          >
            <SwitchThumb
              class="block w-[21px] h-[21px] bg-white rounded-full shadow transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]"
            />
          </SwitchRoot>
        </div>

        <!-- URL Management -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Dictionary URLs (CSV)</h3>
          <div class="flex gap-2 mb-2">
            <input 
              v-model="newUrl" 
              type="text" 
              placeholder="https://example.com/dict.csv" 
              class="flex-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              @keyup.enter="addUrl"
            />
            <button 
              @click="addUrl" 
              class="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          <ul class="max-h-40 overflow-y-auto space-y-2">
            <li v-for="(url, index) in urls" :key="index" class="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span class="truncate flex-1 text-gray-600 dark:text-gray-300 mr-2" :title="url">{{ url }}</span>
              <button @click="removeUrl(index)" class="text-red-500 hover:text-red-700">
                <div class="i-carbon-trash-can text-lg"></div>
              </button>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2">
           <button 
             @click="reload" 
             :disabled="loading"
             class="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
           >
             <div v-if="loading" class="i-carbon-circle-dash animate-spin text-lg"></div>
             <div v-else class="i-carbon-renew text-lg"></div>
             {{ loading ? 'Updating...' : 'Reload Dictionary' }}
           </button>
           
           <div v-if="statusMessage" class="text-xs text-center mt-2" :class="statusMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'">
             {{ statusMessage }}
           </div>
        </div>

      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
