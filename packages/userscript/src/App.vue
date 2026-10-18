<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GM_registerMenuCommand } from '$'

import SettingsDialog from './components/SettingsDialog.vue'
import { useSettings } from './composables/store.ts'
import { portalTarget } from './shadowRoot.ts'

// const handleReload = async () => {
//   changeState('running')
//   await prepareMatcher(window.location.href)
//   if (matcher.value) {
//     toggleObserver(true)
//   } else {
//     changeState('ready')
//   }
// }

// const toggleObserver = (enable: boolean) => {
//   changeState('running')

//   const result = toggle(enable)

//   if (result) {
//     changeState('reset')
//   } else {
//     changeState('ready')
//   }
// }

onMounted(async () => {
  // Register menu command
  GM_registerMenuCommand('Settings', () => {
    showSettings.value = true
  })
  // handleReload()
})
/**
 * ready - can start process
 * running - processing
 * reset - proccessed can be reset to ready
 */
const state = ref<'ready' | 'running' | 'reset'>('running')
function changeState(value: typeof state.value) {
  state.value = value
}

// Note: No more global enabled watch.
// Changes in settings will trigger handleReload via emit.

// const handleToggle = () => {
//   if (state.value === 'ready') {
//     handleReload()
//   } else if (state.value === 'reset') {
//     toggleObserver(false)
//   }
// }

const { showSettings } = useSettings()
</script>

<template>
  <UApp>
    <div>
      <FloatingWidget />
      <UModal
        v-model:open="showSettings"
        :portal="portalTarget"
        :dismissible="false"
        :modal="false"
        :overlay="false"
        title="设置"
      >
        <template #body>
          <div class="min-h-45dvh">
            <SettingsDialog />
          </div>
        </template>
        <template #footer>
          <UButton color="neutral" block size="xl" variant="ghost" @click="showSettings = false"
            >关闭</UButton
          >
        </template>
      </UModal>
    </div>
  </UApp>
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
