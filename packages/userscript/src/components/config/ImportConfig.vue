<script lang="ts" setup>
import { ref, watch } from 'vue';
import { EditableArea, EditableInput, EditablePreview, EditableRoot, TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui';

const url = ref('')
const content = ref('')

const model = defineModel<{
  type: 'url' | 'text',
  value: string
}>()

watch(url, (newVal)=>{
  model.value = {
    type: 'url',
    value: newVal
  }
})
watch(content, (newVal)=>{
  model.value = {
    type: 'text',
    value: newVal
  }
})
</script>

<template>
  <div>
    <TabsRoot class="flex flex-col w-full sm:w-[300px] shadow-sm rounded-lg border" default-value="tab1">
      <TabsList class="relative shrink-0 flex border-b border-blue-400" aria-label="Manage your account">
        <TabsIndicator
          class="absolute px-8 left-0 h-[2px] bottom-0 w-[--reka-tabs-indicator-size] translate-x-[--reka-tabs-indicator-position] translate-y-[1px] rounded-full transition-[width,transform] duration-300">
          <div class="bg-grass8 w-full h-full" />
        </TabsIndicator>
        <TabsTrigger
          class="bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-sm leading-none text-slate-700 select-none rounded-tr-md hover:text-blue-700 data-[state=active]:text-blue-700 outline-none cursor-default focus-visible:relative focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-black"
          value="tab1">
          From URL
        </TabsTrigger>
        <TabsTrigger
          class="bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-sm leading-none text-slate-700 select-none rounded-tl-md  hover:text-blue-700 data-[state=active]:text-blue-700 outline-none cursor-default focus-visible:relative focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-black"
          value="tab2">
          From text
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <EditableRoot
          v-model="url"
          placeholder="Enter URL..."
          class="flex-1 min-w-0"
        >
          <EditableArea class="relative flex items-center">
            <EditablePreview class="w-full truncate rounded-md px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors" />
            <EditableInput class="w-full rounded-md border border-blue-200 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
          </EditableArea>
        </EditableRoot>
      </TabsContent>
      <TabsContent value="tab2">
        <textarea class="w-full min-h-40 max-h-40vh" placeholder="Enter exported config..."
          v-model="content"></textarea>
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<style scoped></style>