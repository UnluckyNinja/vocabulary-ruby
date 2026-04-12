import { defineConfig, presetWind4, presetIcons, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  outputToCssLayers: {
    allLayers: true,
  },
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ]
})
