// Types shared by every feature. Domain models live next to their feature (features/<name>/types).

/** Paginated list envelope returned by the backend's list endpoints. */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}
