export interface Address {
  id: number
  full_name: string
  phone_number: string
  city: string
  address_line: string
  postal_code: string
  is_default: boolean
}

export type AddressInput = Omit<Address, 'id'>
