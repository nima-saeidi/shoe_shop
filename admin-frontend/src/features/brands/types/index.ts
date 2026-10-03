export interface Brand {
  id: number
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
}

export interface BrandInput {
  name: string
  logo_url?: string | null
  is_active: boolean
}
