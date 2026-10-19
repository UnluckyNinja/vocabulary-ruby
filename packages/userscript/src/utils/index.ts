import { Position } from '@vueuse/core'

export function distance(posA: Position, posB: Position) {
  return Math.sqrt(Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2))
}

const emptyDocument = document.createDocumentFragment()
const queryCheck = (s: string) => emptyDocument.querySelector(s)

export function isValidSelector(selector: string) {
  try {
    queryCheck(selector)
    return true
  } catch {
    return false
  }
}
