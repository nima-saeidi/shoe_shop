import Image from 'next/image'
import Link from 'next/link'
import { ProductGrid } from '@/components/product/ProductGrid'
import { primaryImage } from '@/components/product/ProductCard'
import { getCategories, getProducts } from '@/lib/api/catalog'
import { mediaUrl } from '@/lib/media'
import { slugPath } from '@/lib/seo'

// Incremental static regeneration: the page is pre-rendered and refreshed in the background.
export const revalidate = 300

function SectionTitle({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="flex items-center gap-3 text-xl font-bold">
        {children}
        <span aria-hidden="true" className="text-brand">♥</span>
      </h2>
      {href && (
        <Link href={href} className="btn btn-soft !px-4 !py-1.5 text-xs">
          مشاهده همه ‹
        </Link>
      )}
    </div>
  )
}

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getProducts({ is_featured: true, page_size: 8 }),
    getProducts({ page_size: 8, order_by: 'created_at_desc' }),
    getCategories(),
  ])

  const popular = featured.items.length ? featured.items : latest.items
  const heroProduct = popular.find((p) => primaryImage(p)) ?? latest.items.find((p) => primaryImage(p))
  const heroSrc = heroProduct ? mediaUrl(primaryImage(heroProduct)?.image_url) : null

  return (
    <div className="space-y-12">
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-l from-[#f3d6d2] via-[#f6e0dc] to-[#f9ece9] shadow-soft">
        <div className="grid items-center gap-6 p-8 sm:p-12 md:grid-cols-2">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">زیبایی در هر قدم</h1>
            <p className="mt-4 text-base text-ink/80 sm:text-lg">کفش‌های زنانه با طراحی مدرن و کیفیت بالا</p>
            <Link href="/products" className="btn btn-primary mt-7 px-8 py-3">
              مشاهده محصولات ‹
            </Link>
            <p aria-hidden="true" className="mt-5 text-brand">♥</p>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl bg-white/40">
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
                <Link href={`/category/${slugPath(c.slug)}`} className="btn btn-soft px-6 py-3 text-base">
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
