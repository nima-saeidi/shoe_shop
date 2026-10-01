import { Logo } from '@/components/ui/Logo'
import { HeaderActions } from './HeaderActions'
import { MobileMenu } from './MobileMenu'
import { NavLinks, NAV_ITEMS } from './NavLinks'
import { SearchBox } from './SearchBox'

export function Header() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-4 rounded-3xl bg-white/95 px-4 py-2 shadow-soft backdrop-blur sm:px-6">
        <MobileMenu items={NAV_ITEMS} />
        <Logo className="shrink-0" />
        <NavLinks />
        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          <SearchBox className="hidden md:block" />
          <HeaderActions />
        </div>
      </div>
      <SearchBox className="mx-auto mt-2 block max-w-7xl md:hidden" />
    </header>
  )
}
