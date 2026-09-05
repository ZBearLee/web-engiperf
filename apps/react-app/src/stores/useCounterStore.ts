import { create } from 'zustand'

type CounterState = {
  count: number
  increment: () => void
  reset: () => void
}

/** 对标 vue-app 的 Pinia store；Zustand 用 hook 形式消费，无需 Provider 包裹 */
export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}))
