import Image from 'next/image'
import Link from 'next/link'
import { mediaUrl } from '@/utils/media'
import { slugPath } from '@/utils/seo'
import { primaryImage } from '../components/ProductCard'
import { ProductGrid } from '../components/ProductGrid'
import { catalogService } from '../services/catalogService'

function SectionTitle({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
      <h2 className="border-s-4 border-brand ps-3 text-xl font-bold">{children}</h2>
      {href && (
        <Link href={href} className="text-sm font-medium text-brand hover:text-brand-dark">
          مشاهده همه ‹
        </Link>
      )}
    </div>
  )
}

/** Server component: hero, category shortcuts, featured and latest products. */
export async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    catalogService.getProducts({ is_featured: true, page_size: 8 }),
    catalogService.getProducts({ page_size: 8, order_by: 'created_at_desc' }),
    catalogService.getCategories(),
  ])

  const popular = featured.items.length ? featured.items : latest.items
  const heroProduct = popular.find((p) => primaryImage(p)) ?? latest.items.find((p) => primaryImage(p))
  const heroSrc = heroProduct ? mediaUrl(primaryImage(heroProduct)?.image_url) : null

  return (
    <div className="space-y-12">
      <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-l from-navy via-[#1d2540] to-wine text-white shadow-soft">
        <div className="grid items-center gap-8 p-8 sm:p-12 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-md bg-white/10 px-3 py-1 text-xs text-white/80">تولیدی کفش تبریز</p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">کفش زنانه با کیفیت و طراحی روز</h1>
            <p className="mt-4 max-w-md text-base leading-8 text-white/75">
              مجموعه‌ای از کفش پاشنه‌دار، بوت، صندل و کتانی؛ مستقیم از کارگاه تولید و با ارسال به سراسر ایران.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="btn bg-white px-7 py-3 text-brand hover:bg-blush">مشاهده محصولات</Link>
              <Link href="/about" className="btn border border-white/40 px-7 py-3 text-white hover:bg-white/10">درباره پانیک</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20">
            {heroSrc && heroProduct ? (
              <Image
                src={heroSrc}
                alt={heroProduct.name}
                fill
                priority
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl" aria-hidden="true">👠</div>
            )}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section aria-label="دسته‌بندی‌ها">
          <ul className="flex flex-wrap gap-3">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link href={`/category/${slugPath(c.slug)}`} className="btn border border-line bg-white px-6 py-2.5 text-ink hover:border-brand hover:text-brand">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="popular">
        <SectionTitle href="/products">
          <span id="popular">محصولات پرطرفدار</span>
        </SectionTitle>
        <ProductGrid products={popular.slice(0, 8)} priorityCount={4} />
      </section>

      {latest.items.length > 0 && (
        <section aria-labelledby="latest">
          <SectionTitle href="/products">
            <span id="latest">جدیدترین‌ها</span>
          </SectionTitle>
          <ProductGrid products={latest.items.slice(0, 4)} />
        </section>
      )}
    </div>
  )
}
