<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FloatingWidget from './components/FloatingWidget.vue';
import SettingsDialog from './components/SettingsDialog.vue';
import { DictionaryLoader } from './engine/loader';
import { createMatcher } from './engine/matcher';
import { DOMObserver } from './engine/observer';
import { CompressedStorage } from './utils/storage';

const showSettings = ref(false);
const observer = ref<DOMObserver | null>(null);

const initObserver = async () => {
  // Stop existing observer if any
  if (observer.value) {
    observer.value.stop();
    observer.value = null;
  }

  // Check if enabled
  const enabled = await CompressedStorage.get<boolean>('vocabulary_ruby_enabled');
  if (enabled === false) return;

  // Load dictionary
  const dict = await DictionaryLoader.loadDictionary();
  if (!dict || dict.size === 0) {
    console.log('[VocabularyRuby] No dictionary found. Open settings to add CSV URLs.');
    return;
  }

  // Create matcher and observer
  const matcher = await createMatcher(dict);
  observer.value = new DOMObserver(matcher);
  observer.value.start();
};

const handleReload = async () => {
  await initObserver();
};

const handleToggle = async (enabled: boolean) => {
  if (enabled) {
    await initObserver();
  } else {
    if (observer.value) {
      observer.value.stop();
      observer.value = null;
    }
  }
};

onMounted(async () => {
  // Register menu command
  GM_registerMenuCommand('Settings', () => {
    showSettings.value = true;
  });

  await initObserver();
});
</script>

<template>
  <div>
    <FloatingWidget @open-settings="showSettings = true" />
    <SettingsDialog 
      v-model:open="showSettings" 
      @reload-dictionary="handleReload"
      @toggle-enable="handleToggle"
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
