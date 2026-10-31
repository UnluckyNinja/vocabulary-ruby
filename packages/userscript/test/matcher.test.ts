import { describe, it, expect } from 'vite-plus/test'
import { createMatcher } from '../src/engine/matcher'

// 用 Intl.Segmenter 生成真实的 Intl.Segments 作为测试输入
function makeSegments(text: string, granularity: Intl.SegmenterOptions['granularity'] = 'word') {
  const segmenter = new Intl.Segmenter('ja-JP', { granularity })
  return segmenter.segment(text)
}

const dict = new Map([
  ['ピック', 'Pickaxe'],
  ['white', '白'],
])

describe('Matcher', () => {
  it('保留 start 与 segments index 相等的元素', async () => {
    const text = 'theトピックス一覧 white'
    const segments = makeSegments(text)
    const match = await createMatcher(dict)
    expect(match(text, segments)).toMatchInlineSnapshot(`
      [
        {
          "end": 16,
          "start": 11,
          "translation": "白",
        },
      ]
    `)
  })
})
