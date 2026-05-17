import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import PrimaryButton from '../../components/PrimaryButton'
import { housingApi, paymentApi, bookingApi } from '../../api/client'
import { PageBg, PageInner, Card, BackLink, Field, Label, Input, FormRow, ErrorText } from '../../components/UI'
import { formatPrice, diffNights, formatDateRange, CARD_BRANDS } from '../../utils/format'

const SERVICE_FEE = 500

const DetailCard = styled(Card)`
  margin-bottom: 16px;
  h3 { font-size: 14px; font-weight: 700; color: #6B7280; margin-bottom: 8px; }
  .h2 { font-size: 18px; font-weight: 800; margin: 4px 0 8px; }
  .dates { display: flex; justify-content: space-between; color: #6B7280; font-size: 14px; padding-bottom: 14px; border-bottom: 1px solid #E5E7EB; margin-bottom: 14px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #4A5565; }
  .total { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 8px; border-top: 1px solid #E5E7EB; font-size: 16px; }
  .total b { font-weight: 800; }
  .total .p { background: ${({ theme }) => theme.gradients.brand}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 20px; }
`
const Option = styled.label`
  display: flex; gap: 12px; align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid ${({ $sel }) => $sel ? '#16A34A' : '#E5E7EB'};
  background: ${({ $sel }) => $sel ? '#F0FDF4' : '#fff'};
  cursor: pointer;
  margin-bottom: 10px;
  position: relative;
  transition: border-color 200ms ease, background 200ms ease, transform 160ms ease;
  &:hover { transform: translateX(2px); }
  input { accent-color: ${({ theme }) => theme.colors.primarySolid}; flex: none; }
  .ico { width: 32px; height: 22px; border-radius: 4px; background: #94A3B8; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; flex: none; }
  .body { min-width: 0; padding-right: 24px; }
  .t { font-weight: 700; font-size: 14px; word-break: break-word; }
  .s { font-size: 12px; color: #6B7280; }
  &::after {
    content: ${({ $sel }) => $sel ? "'✓'" : "''"};
    position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #16A34A; font-weight: 800;
  }
  @media (max-width: 540px) {
    padding: 12px;
    .t { font-size: 13px; }
  }
`
const AddBtn = styled.button`
  width: 100%; padding: 14px;
  background: #fff; border: 1px dashed #CBD5E1;
  border-radius: 12px; cursor: pointer;
  font-size: 14px; font-weight: 600; color: #0F172A;
  display: inline-flex; gap: 8px; align-items: center; justify-content: center;
`

export default function PaymentPage() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()

  const housing_id = sp.get('housing_id') || id
  const check_in = sp.get('check_in')
  const check_out = sp.get('check_out')
  const guests = Number(sp.get('guests_count') || 1)

  const [item, setItem] = useState(null)
  const [methods, setMethods] = useState([])
  const [sel, setSel] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ card_last4: '', card_brand: 'visa', expiry_month: '', expiry_year: '', cardholder_name: '' })

  useEffect(() => { housingApi.get(housing_id).then(setItem).catch(() => {}) }, [housing_id])
  useEffect(() => { paymentApi.list().then(r => {
    const items = r.items || []
    setMethods(items)
    const def = items.find(m => m.is_default) || items[0]
    if (def) setSel(def.id)
  }) }, [])

  const nights = useMemo(() => diffNights(check_in, check_out), [check_in, check_out])
  const price = item?.price_per_night || 0
  const subtotal = price * nights
  const total = subtotal + (nights ? SERVICE_FEE : 0)

  async function addCard(e) {
    e.preventDefault()
    setErr('')
    try {
      const m = await paymentApi.create({
        card_last4: form.card_last4.slice(-4),
        card_brand: form.card_brand,
        expiry_month: Number(form.expiry_month),
        expiry_year: Number(form.expiry_year),
        cardholder_name: form.cardholder_name,
        is_default: !methods.length
      })
      setMethods(s => [...s, m])
      setSel(m.id)
      setAddOpen(false)
    } catch {
      setErr('Не удалось сохранить карту')
    }
  }

  async function pay() {
    if (!item || !nights) return
    setBusy(true); setErr('')
    try {
      const b = await bookingApi.create({
        housing_id: item.id,
        check_in, check_out,
        guests_count: guests,
        payment_method_id: sel || undefined
      })
      nav(`/app/booking/${b.id}/success`, { replace: true })
    } catch (e) {
      setErr('Не удалось оформить бронирование')
    } finally { setBusy(false) }
  }

  return (
    <PageBg>
      <Header title="Оплата" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>

        <DetailCard>
          <h3>Детали бронирования</h3>
          <div className="h2">{item?.title || 'Объект'}</div>
          <div className="dates"><span>{formatDateRange(check_in, check_out)}</span><span>{nights} ночей</span></div>
          <div className="row"><span>{formatPrice(price)} ₽ × {nights} ночей</span><span>{formatPrice(subtotal)} ₽</span></div>
          <div className="row"><span>Сервисный сбор</span><span>{formatPrice(SERVICE_FEE)} ₽</span></div>
          <div className="total"><b>Итого</b><span className="p">{formatPrice(total)} ₽</span></div>
        </DetailCard>

        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Способ оплаты</h3>
          {methods.map(m => (
            <Option key={m.id} $sel={sel === m.id}>
              <input type="radio" checked={sel === m.id} onChange={() => setSel(m.id)} />
              <span className="ico">{(m.card_brand || '').toUpperCase().slice(0,4)}</span>
              <div>
                <div className="t">{(m.card_brand || '').toUpperCase()} •••• {m.card_last4}</div>
                <div className="s">Срок действия: {String(m.expiry_month).padStart(2,'0')}/{String(m.expiry_year).slice(-2)}</div>
              </div>
            </Option>
          ))}

          {addOpen ? (
            <form onSubmit={addCard} style={{ marginTop: 4 }}>
              <Field>
                <Label>Номер карты (последние 4)</Label>
                <Input value={form.card_last4} onChange={e => setForm({ ...form, card_last4: e.target.value.replace(/\D/g,'') })} maxLength={4} placeholder="4242" required />
              </Field>
              <FormRow>
                <Field>
                  <Label>Срок MM</Label>
                  <Input value={form.expiry_month} onChange={e => setForm({ ...form, expiry_month: e.target.value })} placeholder="12" required />
                </Field>
                <Field>
                  <Label>Срок YYYY</Label>
                  <Input value={form.expiry_year} onChange={e => setForm({ ...form, expiry_year: e.target.value })} placeholder="2028" required />
                </Field>
              </FormRow>
              <Field>
                <Label>Бренд</Label>
                <select value={form.card_brand} onChange={e => setForm({ ...form, card_brand: e.target.value })}
                  style={{ width: '100%', height: 44, padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: 12, fontFamily: 'inherit', fontSize: 14, background: '#fff' }}>
                  {CARD_BRANDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </Field>
              <Field>
                <Label>Имя владельца карты</Label>
                <Input value={form.cardholder_name} onChange={e => setForm({ ...form, cardholder_name: e.target.value.toUpperCase() })} placeholder="IVAN PETROV" required />
              </Field>
              <div style={{ display: 'flex', gap: 8 }}>
                <PrimaryButton type="submit">Сохранить карту</PrimaryButton>
                <button type="button" onClick={() => setAddOpen(false)} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 20px', cursor: 'pointer', fontWeight: 600 }}>Отмена</button>
              </div>
            </form>
          ) : (
            <AddBtn type="button" onClick={() => setAddOpen(true)}>＋ Добавить новую карту</AddBtn>
          )}
        </Card>

        {err && <ErrorText style={{ marginBottom: 12 }}>{err}</ErrorText>}

        <PrimaryButton onClick={pay} disabled={busy || !nights} style={{ width: '100%' }}>
          {busy ? 'Оплачиваем…' : `Оплатить ${formatPrice(total)} ₽`}
        </PrimaryButton>
      </PageInner>
    </PageBg>
  )
}
