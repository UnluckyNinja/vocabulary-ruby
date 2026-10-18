<script setup lang="ts">
import {
  useWindowSize,
  useElementSize,
  Position,
  clamp,
  useDraggable,
  onClickOutside,
} from '@vueuse/core'
import { computed, nextTick, onMounted, reactive, ref, useTemplateRef } from 'vue'
import { wrapper as hostElement, portalTarget } from '../shadowRoot'
import { distance } from '../utils'
import { useFloatButtonPosition } from '../composables/float'

const props = defineProps<{
  icon?: string
}>()

const emit = defineEmits<{
  dragStart: []
}>()

const open = ref(false)

const icon = computed(() => {
  return open.value ? 'i-lucide:x' : 'i-lucide:settings-2'
})

const wrapper = useTemplateRef('wrapper')

const windowSize = useWindowSize({
  includeScrollbar: false,
})

const wrapperSize = useElementSize(wrapper, {
  width: 48,
  height: 48,
})

function clampPos(pos: Position) {
  pos.x = clamp(
    pos.x,
    wrapperSize.width.value / 2,
    windowSize.width.value - wrapperSize.width.value / 2,
  )
  pos.y = clamp(
    pos.y,
    wrapperSize.height.value / 2,
    windowSize.height.value - wrapperSize.height.value / 2,
  )
  return pos
}

const cancelClick = ref(false)
const emittedDrag = ref(false)

const { position: storedPos } = useFloatButtonPosition()

const startPosition = ref<Position>(clampPos(storedPos.value))

const { x, y, style, isDragging } = useDraggable(wrapper, {
  initialValue: startPosition.value,
  onStart(position) {
    startPosition.value = position
  },
  onMove() {
    cancelClick.value = true
    // close panel when dragging
    if (!emittedDrag.value) {
      open.value = false
      emittedDrag.value = true
    }
  },
  onEnd(position) {
    clampPos(position)
    if (startPosition && distance(startPosition.value, position) < 2.5) {
      cancelClick.value = false
    } else {
      setTimeout(() => {
        cancelClick.value = false
      }, 10)
    }
    storedPos.value = position
    emittedDrag.value = false
  },
})

onMounted(() => {
  // 放一帧等元素重排完毕获取真实大小
  nextTick(() => {
    const pos = reactive({ x, y })
    clampPos(pos)
  })
})

function cancelClickWhenDragging(event: MouseEvent) {
  if (cancelClick.value) {
    event.stopPropagation()
    return
  }
}

const popover = useTemplateRef('popover')
onClickOutside(popover, event => {
  // Nuxt UI Popover doesn't correctly handle shadow dom clicking event,
  // it will close and immediately open again.
  // We have to do it manually
  if (event.target instanceof Element) {
    if (hostElement.contains(event.target)) {
      return
    }
  }
  open.value = false
})
</script>

<template>
  <UPopover :portal="portalTarget" :open="open" :content="{ side: 'left', align: 'end' }" arrow>
    <div ref="wrapper" class="fixed" :style="style" @click.capture="cancelClickWhenDragging">
      <UButton
        class="text-3xl p-2"
        size="xl"
        :class="[isDragging ? 'cursor-move' : 'cursor-pointer']"
        variant="subtle"
        @click="() => (open = !open)"
      >
        <div :class="icon"></div>
      </UButton>
    </div>
    <template #content>
      <QuickPanel ref="popover"></QuickPanel>
    </template>
  </UPopover>
</template>
