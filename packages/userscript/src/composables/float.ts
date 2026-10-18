import { createGlobalState, useStorage, useWindowSize } from '@vueuse/core'
import { GMStorage } from './store'

export const useFloatButtonPosition = createGlobalState(() => {
  const windowSize = useWindowSize({
    includeScrollbar: false,
  })
  const position = useStorage(
    'floatButtonPosition',
    { x: windowSize.width.value, y: 40 },
    GMStorage,
  )
  return {
    position,
  }
})
