<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue';
import FloatingWidget from './components/FloatingWidget.vue';
import SettingsDialog from './components/SettingsDialog.vue';
import { createMatcher, type Matcher } from './engine/matcher';
import { DOMObserver } from './engine/observer';
import { getActiveConfigs, loadRegistry } from './utils/config';
import { GM_registerMenuCommand } from '$'

const showSettings = ref(false);
const matcher = shallowRef<Matcher | null>(null)
const observer = shallowRef<DOMObserver | null>(null);
const registry = loadRegistry()

async function prepareMatcher() {
  // Find active configs for current site
  const activeConfigs = getActiveConfigs(window.location.href, registry.value);
  
  if (activeConfigs.length === 0) {
    console.log('[VocabularyRuby] No active profiles match this site.');
    return;
  }

  // Aggregate dictionaries
  // const combinedMap = await processDictionaries(activeConfigs);
  const combinedMap = new Map();
  
  if (combinedMap.size === 0) {
    console.log('[VocabularyRuby] No entries found in active dictionaries.');
    return;
  }

  // Create matcher
  matcher.value = await createMatcher(combinedMap);
}

const handleReload = async () => {
  await prepareMatcher()
  if (matcher.value) {
    toggleObserver(true);
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
    toggleObserver(true);
  } else if (state.value === 'reset') {
    toggleObserver(false);
  }
};
</script>

<template>
  <div>
    <FloatingWidget :state="state" @toggle="handleToggle" @settings="showSettings = !showSettings" />
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
