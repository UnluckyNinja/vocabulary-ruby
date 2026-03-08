<script setup lang="ts">
import { ref, onMounted, shallowRef, watch } from 'vue';
import FloatingWidget from './components/FloatingWidget.vue';
import SettingsDialog from './components/SettingsDialog.vue';
import { DictionaryLoader } from './engine/loader';
import { createMatcher, type Matcher } from './engine/matcher';
import { DOMObserver } from './engine/observer';
import { CompressedStorage } from './utils/storage';
import { GM_registerMenuCommand } from '$'

const showSettings = ref(false);
const matcher = shallowRef<Matcher | null>(null)
const observer = shallowRef<DOMObserver | null>(null);

async function prepareMatcher() {
  // Load dictionary
  const dict = await DictionaryLoader.loadDictionary();
  if (!dict || dict.size === 0) {
    console.log('[VocabularyRuby] No dictionary found. Open settings to add CSV URLs.');
    return null;
  }

  // Create matcher
  matcher.value = await createMatcher(dict);
}

const handleReload = async () => {
  prepareMatcher()
  toggleObserver(true);
};

const toggleObserver = (enable: boolean) => {
  changeState('running')

  if (enable) {
    if (!matcher.value) {
      console.error('Matcher is null')
      changeState('ready')
      return
    }
    if (observer.value) {
      observer.value.stop();
      observer.value = null;
    }
    observer.value = new DOMObserver(matcher.value);
    changeState('reset')
  } else {
    if (observer.value) {
      observer.value.stop();
      observer.value = null;
    }
    changeState('ready')
  }
};

onMounted(async () => {
  // Register menu command
  GM_registerMenuCommand('Settings', () => {
    showSettings.value = true;
  });

  await prepareMatcher()

  // Check if enabled
  const enabled = CompressedStorage.get<boolean>('vocabulary_ruby_enabled');
  toggleObserver(!!enabled)
});

const state = ref<'ready' | 'running' | 'reset'>('running')
function changeState(value: typeof state.value){
  state.value = value
}

const enabled = ref(false)

watch(enabled, (newVal)=>{
  toggleObserver(newVal)
})

</script>

<template>
  <div>
    <FloatingWidget :state="state" @toggle="enabled = !enabled" @settings="showSettings = !showSettings" />
    <SettingsDialog 
      v-model:open="showSettings" 
      @reload-dictionary="handleReload"
    />
  </div>
</template>

<style>
/* Global styles for Ruby if needed */
ruby {
  ruby-position: over;
}
rt {
  font-size: 0.6em;
  color: #888;
}
</style>
