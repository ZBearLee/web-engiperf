import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      server: {
        deps: {
          // element-plus 内部 import 了 base.css，默认被 external 给 node 原生加载会报
          // "Unknown file extension .css"。inline 让它走 vite 转换，css 被安全忽略。
          inline: ['element-plus'],
        },
      },
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
