<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue';
import { ToastProvider, ToastViewport } from 'reka-ui';
import { GM_registerMenuCommand } from '$'

import { createMatcher, type Matcher } from './engine/matcher';
import { DOMObserver } from './engine/observer';
import { getActiveConfigs } from './config/index';
import { loadDictionary } from './engine/loader';

import FloatingWidget from './components/FloatingWidget.vue';
import SettingsDialog from './components/SettingsDialog.vue';

const showSettings = ref(false);
const matcher = shallowRef<Matcher | null>(null)
const observer = shallowRef<DOMObserver | null>(null);

async function prepareMatcher() {
  // Find active configs for current site
  const activeConfigs = getActiveConfigs(window.location.href);
  
  if (activeConfigs.length === 0) {
    console.log('[VocabularyRuby] No active profiles match this site.');
    return;
  }

  // Aggregate dictionaries
  // const combinedMap = await processDictionaries(activeConfigs);
  const combinedMap = new Map()
  activeConfigs.forEach(it=>{
    const dictCache = loadDictionary(it.id)
    dictCache.forEach((value, key)=>{
      combinedMap.set(key, value)
    })
  });
  
  if (combinedMap.size === 0) {
    console.log('[VocabularyRuby] No entries found in active dictionaries.');
    return;
  }

  // Create matcher
  matcher.value = await createMatcher(combinedMap);
}

const handleReload = async () => {
  changeState('running')
  await prepareMatcher()
  if (matcher.value) {
    toggleObserver(true);
  }else {
    changeState('ready')
  }
};

const toggleObserver = (enable: boolean) => {
  changeState('running')

  if (enable && matcher.value) {
    if (observer.value) {
      observer.value.stop();
      observer.value = null;
    }
    observer.value = new DOMObserver(matcher.value);
    observer.value.start();
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
  handleReload()
});
/**
 * ready - can start process
 * running - processing
 * reset - proccessed can be reset to ready
 */
const state = ref<'ready' | 'running' | 'reset'>('running')
function changeState(value: typeof state.value){
  state.value = value
}

// Note: No more global enabled watch. 
// Changes in settings will trigger handleReload via emit.

const handleToggle = () => {
  if (state.value === 'ready') {
    handleReload()
  } else if (state.value === 'reset') {
    toggleObserver(false);
  }
};
</script>

<template>
  <ToastProvider>
    <FloatingWidget :state="state" @toggle="handleToggle" @settings="showSettings = !showSettings" />
    <SettingsDialog 
      v-model:open="showSettings" 
      @reload-dictionary="handleReload"
    />
    <ToastViewport class="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none"  />
  </ToastProvider>
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
