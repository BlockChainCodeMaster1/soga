import { StateCreator } from 'zustand'
import { RootStore } from './root'

export interface DataSlice {
  burnAmount: number
  setBurnAmount: (burnAmount: number) => void
}

export const createDataSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  DataSlice
> = (set) => ({
  burnAmount: 0,

  setBurnAmount(burnAmount) {
    set({ burnAmount: burnAmount })
  },
})
