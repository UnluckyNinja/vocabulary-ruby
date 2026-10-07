import { Position } from '@vueuse/core'

export function distance(posA: Position, posB: Position) {
  return Math.sqrt(Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2))
}
