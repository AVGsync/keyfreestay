import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { paymentApi } from '../../api/client'
import PrimaryButton from '../../components/PrimaryButton'
import { PageBg, PageInner, Card, BackLink, Field, Label, Input, FormRow, ErrorText } from '../../components/UI'
import { CARD_BRANDS } from '../../utils/format'

const InfoBanner = styled.div`
  background: rgba(42,141,255,0.08);
  border-radius: 12px;
  padding: 14px 18px; font-size: 13px;
  color: ${({ theme }) => theme.colors.primarySolid};
  margin-bottom: 20px;
`
const Row = styled.div`
  display: flex; gap: 12px; align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid ${({ $on }) => $on ? '#16A34A' : '#E5E7EB'};
  background: ${({ $on }) => $on ? '#F0FDF4' : '#fff'};
  margin-bottom: 10px;
  transition: border-color 200ms ease, background 200ms ease;
  .check { color: ${({ $on }) => $on ? '#16A34A' : '#94A3B8'}; }
  .ic { width: 32px; height: 22px; border-radius: 4px; background: #94A3B8; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex: none; }
  .body { flex: 1; min-width: 0; }
  .t { font-weight: 700; font-size: 14px; word-break: break-word; }
  .s { font-size: 12px; color: #6B7280; margin-top: 2px; }
  button.del { background: none; border: none; cursor: pointer; color: #DC2626; transition: transform 160ms ease; }
  button.del:hover { transform: scale(1.1); }
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

export default function PaymentMethodsPage() {
  const nav = useNavigate()
  const [list, setList] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ card_last4: '', card_brand: 'visa', expiry_month: '', expiry_year: '', cardholder_name: '', is_default: true })
  const [err, setErr] = useState('')

  function reload() { paymentApi.list().then(r => setList(r.items || [])).catch(() => {}) }
  useEffect(reload, [])

  async function add(e) {
    e.preventDefault(); setErr('')
    try {
      await paymentApi.create({
        ...form,
        card_last4: form.card_last4.slice(-4),
        expiry_month: Number(form.expiry_month),
        expiry_year: Number(form.expiry_year)
      })
      setOpen(false)
      setForm({ card_last4: '', card_brand: 'visa', expiry_month: '', expiry_year: '', cardholder_name: '', is_default: false })
      reload()
    } catch { setErr('Не удалось сохранить карту') }
  }

  async function remove(id) {
    if (!confirm('Удалить карту?')) return
    try { await paymentApi.remove(id); reload() } catch {}
  }

  return (
    <PageBg>
      <Header title="Личный кабинет / Способы оплаты" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <InfoBanner>Управляйте сохранёнными способами оплаты. Основная карта будет использоваться по умолчанию при оформлении бронирования.</InfoBanner>

          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Способ оплаты</h3>
            {list.map(m => (
              <Row key={m.id} $on={m.is_default}>
                <span className="check">✓</span>
                <span className="ic">{(m.card_brand || '').toUpperCase().slice(0,4)}</span>
                <div className="body">
                  <div className="t">{(m.card_brand || '').toUpperCase()} •••• {m.card_last4}</div>
                  <div className="s">Срок действия: {String(m.expiry_month).padStart(2,'0')}/{String(m.expiry_year).slice(-2)}</div>
                </div>
                <button className="del" onClick={() => remove(m.id)} title="Удалить">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                </button>
              </Row>
            ))}

            {open ? (
              <form onSubmit={add} style={{ marginTop: 10 }}>
                <Field>
                  <Label>Номер карты (последние 4)</Label>
                  <Input value={form.card_last4} maxLength={4} onChange={e => setForm({ ...form, card_last4: e.target.value.replace(/\D/g,'') })} placeholder="4242" required />
                </Field>
                <FormRow>
                  <Field><Label>Срок MM</Label><Input value={form.expiry_month} onChange={e => setForm({ ...form, expiry_month: e.target.value })} placeholder="12" required /></Field>
                  <Field><Label>Срок YYYY</Label><Input value={form.expiry_year} onChange={e => setForm({ ...form, expiry_year: e.target.value })} placeholder="2028" required /></Field>
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
                <Field>
                  <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                    <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} /> Сделать основной
                  </label>
                </Field>
                {err && <ErrorText style={{ marginBottom: 10 }}>{err}</ErrorText>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <PrimaryButton type="submit">Сохранить карту</PrimaryButton>
                  <button type="button" onClick={() => setOpen(false)} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 20px', cursor: 'pointer', fontWeight: 600 }}>Отмена</button>
                </div>
              </form>
            ) : (
              <AddBtn onClick={() => setOpen(true)}>＋ Добавить новую карту</AddBtn>
            )}
          </Card>

          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Безопасность платежей 🔒</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8, color: '#16A34A', fontSize: 13 }}>
              <li>✓ Все платёжные данные шифруются с использованием SSL/TLS</li>
              <li>✓ CVV код не сохраняется и запрашивается при каждой оплате</li>
              <li>✓ Соответствие стандарту PCI DSS</li>
            </ul>
          </Card>
        </div>
      </PageInner>
    </PageBg>
  )
}
