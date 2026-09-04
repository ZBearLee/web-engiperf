import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'
// 说明：devtools 插件内置的 web-vitals 监控有已知 bug（页面切换时报 startTime undefined 污染控制台），
// 且其功能与浏览器 Vue Devtools 扩展重复——已禁用。后续性能专题会用 web-vitals 库自建监控（更准确也更有教学价值）
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // Element Plus 按需自动导入：
    // - AutoImport：el-message 等 API 的 import 自动注入
    // - Components：模板里 <el-xxx> 自动解析为按需导入（无需手动 import）
    // 对比全量引入（main.ts import ElementPlus + 全量 css），bundle 显著更小
    AutoImport({
      imports: [
        'vue',           // ref, computed, watch, onMounted 等
        'vue-router',    // useRoute, useRouter, createRouter 等
        'pinia',         // defineStore, storeToRefs 等（如果你用 Pinia）
      ],
      resolvers: [ElementPlusResolver()],
      dts: true,         // 这个默认就是 true，可以省略
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
