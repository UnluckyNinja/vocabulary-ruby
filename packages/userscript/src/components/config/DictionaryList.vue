<script lang="ts" setup>
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  EditableArea,
  EditableInput,
  EditablePreview,
  EditableRoot,
  SwitchRoot,
  SwitchThumb,
} from "reka-ui";
import { DictionarySource } from "../../config/configType";
import { computed, ref, watch } from "vue";
import { AlertDialogContent, AlertDialogRoot } from "../ui/AlertDialog";

const props = withDefaults(
  defineProps<{
    configID: string;
    readonly?: boolean;
    failed?: string[];
  }>(),
  {
    readonly: false,
    failed: () => [],
  },
);

const emit = defineEmits<{
  dictChanged: [];
}>();

const shouldDisableChange = computed(() => {
  return props.readonly;
});

const dicts = defineModel<DictionarySource[]>({ required: true });

function isFailed(id: string) {
  return props.failed.includes(id);
}

const openDeleteConfirm = ref(false);
const selectedDictDeleteID = ref("");
const selectedDictDelete = computed(() => {
  if (!selectedDictDeleteID.value) return undefined;
  return dicts.value.find((it) => it.id === selectedDictDeleteID.value);
});
function onSelectDelete(configID: string) {
  selectedDictDeleteID.value = configID;
  openDeleteConfirm.value = true;
}
watch(openDeleteConfirm, (newVal) => {
  if (!newVal) {
    selectedDictDeleteID.value = "";
  }
});
function handleDeleting() {
  const idx = dicts.value.findIndex((it) => it.id === selectedDictDeleteID.value);
  if (idx >= 0) {
    dicts.value.splice(idx, 1);
    openDeleteConfirm.value = false;
    emit("dictChanged");
  }
}
</script>

<template>
  <AccordionRoot class="flex flex-col gap-2" type="single" :collapsible="true">
    <template v-for="dict in modelValue" :key="dict.id">
      <AccordionItem :value="dict.id">
        <AccordionHeader class="flex items-center gap-2">
          <div
            v-if="!shouldDisableChange"
            class="cursor-grab p-1 text-slate-300 hover:text-slate-500 transition-colors active:cursor-grabbing"
          >
            <div class="i-carbon:draggable h-5 w-5"></div>
          </div>
          <EditableRoot class="flex-1" v-model="dict.name" :readonly="shouldDisableChange">
            <EditableArea>
              <EditablePreview class="inline-block w-full p-2 rounded bg-slate/10" />
              <EditableInput class="p-2 w-full bg-gray/10" />
            </EditableArea>
          </EditableRoot>
          <div
            v-if="isFailed(dict.id)"
            class="i-carbon:warning-alt text-amber-700 mr-4"
            :title="
              dict.isRemote ? 'Error when processing remote resource' : 'This dictionary is invalid'
            "
          ></div>
          <div class="i-carbon:link"></div>
          <SwitchRoot
            v-if="!shouldDisableChange"
            v-model="dict.isRemote"
            class="inline-block w-[32px] h-[20px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:shadow-stone-800"
          >
            <SwitchThumb
              class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
            />
          </SwitchRoot>
          <button
            v-if="!shouldDisableChange"
            @click="onSelectDelete(dict.id)"
            title="Delete this config"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
          >
            <div class="i-carbon:trash-can h-4 w-4"></div>
          </button>
          <AccordionTrigger class="group">
            <div
              class="i-carbon:chevron-down transition-transform duration-300 ease-out group-data-[state=open]:rotate-180"
            ></div>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <div v-if="dict.isRemote">
            <EditableRoot
              class="m-1"
              placeholder="Remote URL"
              @update:modelValue="emit('dictChanged')"
              v-model="dict.updateURL"
              :readonly="shouldDisableChange"
            >
              <EditableArea>
                <EditablePreview class="inline-block w-full p-2 rounded bg-slate/10" />
                <EditableInput class="p-2 w-full bg-gray/10" />
              </EditableArea>
            </EditableRoot>
          </div>
          <div v-else>
            <textarea
              @change="emit('dictChanged')"
              class="m-1 p-2 rounded w-full min-h-20 max-h-30 field-sizing-content bg-slate/20"
              v-model="dict.content"
              :readonly="shouldDisableChange"
            ></textarea>
          </div>
        </AccordionContent>
      </AccordionItem>
    </template>
    <AlertDialogRoot v-model:open="openDeleteConfirm">
      <AlertDialogContent>
        <template #title>
          <div class="font-extrabold">Deleting dictionary</div>
        </template>
        <div class="p-8 text-slate-800">
          You are about to delete dictionary "{{ selectedDictDelete?.name }}".<br />
          This action cannot be undone. Are you sure?
        </div>
        <template #footer>
          <button
            @click="handleDeleting"
            class="bg-red-600 hover:bg-red-400 text-slate-100 cursor-pointer p-2 rounded"
          >
            Delete
          </button>
          <button
            @click="openDeleteConfirm = false"
            class="hover:bg-slate-200 text-slate-800 cursor-pointer p-2 rounded"
          >
            Cancel
          </button>
        </template>
      </AlertDialogContent>
    </AlertDialogRoot>
  </AccordionRoot>
</template>

<style scoped></style>
