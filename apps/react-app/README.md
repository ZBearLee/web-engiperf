# React 子应用

和 vue-app 结构对称，用来做 Vue 与 React 的对比学习。

技术栈：Vite 8 / React 19 / TypeScript 6 / React Router 7 / Zustand / Ant Design 6 / Sass / oxlint / Prettier

常用命令：
- `pnpm --filter react-app dev`：本地开发，端口 5174
- `pnpm --filter react-app build`：构建
- `pnpm --filter react-app lint`：修复式 lint（oxlint --fix）

约定：
- 菜单和面包屑由路由配置在运行时派生，不用单独维护一份菜单配置。
- 一个菜单对应 views/ 下的一个目录，私有子组件收进同级 `_components/`。
- 页面用 `React.lazy` 按路由懒加载。
