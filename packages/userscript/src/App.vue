<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ToastProvider, ToastViewport } from 'reka-ui';
import { GM_registerMenuCommand } from '$'


import FloatingWidget from './components/FloatingWidget.vue';
import SettingsDialog from './components/SettingsDialog.vue';
import { useMatcher } from './composables/useMatcher';
import ToastContainer from './components/toast/ToastContainer.vue';

const showSettings = ref(false);

const { matcher, observer, prepareMatcher, toggleObserver: toggle } = useMatcher()

const handleReload = async () => {
  changeState('running')
  await prepareMatcher(window.location.href)
  if (matcher.value) {
    toggleObserver(true);
  } else {
    changeState('ready')
  }
};

const toggleObserver = (enable: boolean) => {
  changeState('running')

  const result = toggle(enable)

  if (result) {
    changeState('reset')
  } else {
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
    <div>
      <ToastContainer />
    </div>
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
