import type { MessageInstance } from 'antd/es/message/interface'

let instance: MessageInstance | null = null

/** Called once by ThemeProvider with the context-aware instance from antd's <App>. */
export function bindMessage(api: MessageInstance) {
  instance = api
}

/**
 * Toasts that respect the ConfigProvider (RTL, font, colors) and can be called from anywhere,
 * including the React Query cache callbacks that live outside the component tree.
 */
export const message = {
  success: (content: string) => instance?.success(content),
  error: (content: string) => instance?.error(content),
  warning: (content: string) => instance?.warning(content),
}
