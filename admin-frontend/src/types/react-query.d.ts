import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Skip the global error toast (the caller renders the error itself). */
      silent?: boolean
    }
  }
}
