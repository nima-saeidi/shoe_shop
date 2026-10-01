import { Logo } from '@/components/ui/Logo'
import { HeaderActions } from './HeaderActions'
import { MobileMenu } from './MobileMenu'
import { NavLinks, NAV_ITEMS } from './NavLinks'
import { SearchBox } from './SearchBox'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="bg-navy text-[12px] text-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6">
          <p>ارسال به سراسر ایران · تولید مستقیم در تبریز</p>
          <p className="hidden sm:block">
            پشتیبانی: <a href="tel:+984133000000" dir="ltr" className="font-medium text-white">۰۴۱-۳۳۰۰۰۰۰۰</a>
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <MobileMenu items={NAV_ITEMS} />
        <Logo className="shrink-0" />
        <SearchBox className="mx-4 hidden max-w-xl flex-1 md:block" />
        <div className="ms-auto md:ms-0">
          <HeaderActions />
        </div>
      </div>

      <div className="hidden border-t border-line lg:block">
        <div className="mx-auto max-w-7xl px-6">
          <NavLinks />
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  )
}
