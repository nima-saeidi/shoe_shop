export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  parent_id: number | null
  is_active: boolean
}

export interface CategoryInput {
  name: string
  description?: string | null
  parent_id?: number | null
  is_active: boolean
}
