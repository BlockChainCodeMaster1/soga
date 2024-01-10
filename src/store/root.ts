import { createDataSlice, DataSlice } from './dataSlice'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { create, StoreApi, UseBoundStore } from 'zustand'

export type RootStore = DataSlice

export const useRootStore = create<RootStore>()(
  subscribeWithSelector(
    devtools((...args) => {
      return {
        ...createDataSlice(...args),
      }
    })
  )
)

export type Store<T> = UseBoundStore<StoreApi<T>>

const storeResetFns = new Set<() => void>()

export const resetAllStores = () => {
  storeResetFns.forEach((resetFn) => {
    resetFn()
  })
}

const initialState: RootStore | any = useRootStore.getState()

storeResetFns.add(() => {
  useRootStore.setState(initialState, true)
})
