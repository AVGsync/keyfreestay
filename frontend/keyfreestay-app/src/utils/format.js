const MINIO_BASE = (typeof window !== 'undefined' && window.__MINIO_BASE__) || 'http://localhost:9000'

export function fixUrl(u) {
  if (!u) return ''
  let s = String(u).trim()
  // protocol-relative or absolute path: collapse leading slashes to single
  s = s.replace(/^\/{2,}/, '/')
  // looks like host:port without protocol → prepend http://
  if (/^[a-z0-9][a-z0-9.-]*:\d+(\/|$)/i.test(s) && !/^https?:\/\//i.test(s)) {
    s = 'http://' + s
  }
  // collapse non-protocol double slashes
  s = s.replace(/([^:])\/{2,}/g, '$1/')
  // relative path → bind to MinIO base
  if (s.startsWith('/')) s = MINIO_BASE + s
  // MinIO objects live at /housing/housing/{id}/{file} — inject bucket prefix if missing
  const m = s.match(/^(https?:\/\/[^/]+)\/housing\/(.+)$/i)
  if (m && !/^housing\//i.test(m[2])) {
    s = `${m[1]}/housing/housing/${m[2]}`
  }
  return s
}

export function formatPrice(n) {
  if (n == null) return '0'
  const num = Number(n)
  return num.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
}

export function formatDateRange(from, to) {
  if (!from || !to) return ''
  const a = new Date(from), b = new Date(to)
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}-${b.getDate()} ${months[a.getMonth()]} ${a.getFullYear()}`
  }
  return `${a.getDate()} ${months[a.getMonth()]} ${a.getFullYear()} — ${b.getDate()} ${months[b.getMonth()]} ${b.getFullYear()}`
}

export function formatDate(d) {
  if (!d) return ''
  const x = new Date(d)
  const dd = String(x.getDate()).padStart(2,'0')
  const mm = String(x.getMonth()+1).padStart(2,'0')
  return `${dd}.${mm}.${x.getFullYear()}`
}

export function isoDate(d) {
  if (!d) return ''
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`
}

export function diffNights(from, to) {
  if (!from || !to) return 0
  const a = new Date(from), b = new Date(to)
  const ms = b - a
  return Math.max(0, Math.round(ms / 86400000))
}

export const AMENITY_LABEL = {
  kitchen: 'Кухня',
  wifi: 'Wi-Fi',
  air_conditioner: 'Кондиционер',
  parking: 'Парковка',
  washing_machine: 'Стиральная машина',
  heating: 'Отопление',
  smart_lock: 'Умный замок',
  smart_lighting: 'Умное освещение',
  smart_thermostat: 'Умный термостат',
  voice_assistant: 'Голосовой ассистент'
}
export const COMFORTS = ['kitchen','wifi','air_conditioner','parking','washing_machine','heating']
export const SMART = ['smart_lock','smart_lighting','smart_thermostat','voice_assistant']

export function mapAmenityLabel(k) { return AMENITY_LABEL[k] || k }

export const HOUSING_TYPES = [
  { value: 'apartment', label: 'Квартира', icon: '🏢' },
  { value: 'house', label: 'Дом', icon: '🏠' },
  { value: 'office', label: 'Офис', icon: '🏬' }
]

export const CANCELLATION_POLICIES = [
  { value: 'flexible', label: 'Гибкая', desc: 'Полный возврат за 1 день' },
  { value: 'moderate', label: 'Умеренная', desc: 'Полный возврат за 5 дней' },
  { value: 'strict', label: 'Строгая', desc: 'Возврат 50% за 7 дней' }
]

export const CARD_BRANDS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'mir', label: 'Мир' },
  { value: 'unionpay', label: 'UnionPay' },
  { value: 'other', label: 'Другая' }
]
