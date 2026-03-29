import { defineConfig, presetWind4, presetIcons, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
    }),
  ],
  outputToCssLayers: {
    allLayers: true,
  },
  transformers: [
    transformerDirectives(),
  ]
})
