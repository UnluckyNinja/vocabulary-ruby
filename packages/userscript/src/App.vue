<script setup lang="ts">
import { onMounted } from 'vue'
import { GM_registerMenuCommand } from '$'

import SettingsDialog from './components/SettingsDialog.vue'
import { useSettings } from './composables/store.ts'
import { portalTarget } from './shadowRoot.ts'
import { useRuby } from './composables/ruby.ts'
import { useRuleMatch } from './composables/rule.ts'

const { startWithRule } = useRuby()
const { currentRule, reloadCurrentRule } = useRuleMatch()

reloadCurrentRule()

onMounted(async () => {
  GM_registerMenuCommand('Settings', () => {
    showSettings.value = true
  })
  if (currentRule.value) {
    startWithRule(currentRule.value)
  }
})

const { showSettings } = useSettings()
</script>

<template>
  <UApp :portal="portalTarget">
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

<style></style>
