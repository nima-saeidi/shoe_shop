import dayjs from 'dayjs'
import 'dayjs/locale/fa'
import jalaliPlugin from 'jalali-plugin-dayjs'

// The whole panel runs on the Jalali calendar with Persian labels. Imported once from main.tsx.
dayjs.extend(jalaliPlugin)

// The date pickers read month names from the dayjs locale (Gregorian: ژانویه، فوریه...).
// Since the whole panel runs on the Jalali calendar, swap in the Persian month names.
const JALALI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const faLocale = dayjs.Ls.fa as { months?: unknown; monthsShort?: unknown }
faLocale.months = JALALI_MONTHS
faLocale.monthsShort = JALALI_MONTHS
dayjs.calendar('jalali')
dayjs.locale('fa')

export default dayjs
