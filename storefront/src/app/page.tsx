import { HomePage } from '@/features/catalog/pages/HomePage'

// Incremental static regeneration: the page is pre-rendered and refreshed in the background.
export const revalidate = 300

export default function Page() {
  return <HomePage />
}
