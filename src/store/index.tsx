import { ThemeMode } from 'antd-style'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface AppState {
  themeMode: ThemeMode
  onSetThemeMode: (themeMode: ThemeMode) => void
}

export const useAppStore = create<AppState>()(
  devtools((set) => ({
    themeMode: 'auto',
    onSetThemeMode: (themeMode) => {
      set(() => ({ themeMode }), false, 'onSetThemeMode')
    },
  }))
)
