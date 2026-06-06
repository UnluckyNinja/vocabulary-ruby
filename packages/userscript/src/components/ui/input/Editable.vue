<script lang="ts" setup>
import { EditableArea, EditableInput, EditablePreview, EditableRoot } from 'reka-ui';

const model = defineModel()
</script>

<template>
  <EditableRoot>
    <EditableArea>
      <EditablePreview class="inline-block p-2 pl-1 rounded hover:bg-slate/10" />
      <EditableInput class="p-2 pl-1 bg-slate/10" />
    </EditableArea>
  </EditableRoot>
</template>

<style scoped></style>