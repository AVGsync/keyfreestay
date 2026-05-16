import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { bookingApi, housingApi } from '../../api/client'
import PrimaryButton from '../../components/PrimaryButton'
import { PageBg, PageInner, Card } from '../../components/UI'
import { formatPrice, formatDateRange } from '../../utils/format'

const SuccessCard = styled(Card)`
  max-width: 560px; margin: 24px auto; padding: 32px;
  text-align: center;
`
const Tick = styled.div`
  width: 80px; height: 80px; border-radius: 50%;
  background: #DCFCE7;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
  color: #16A34A;
`
const Details = styled.div`
  background: #F8FAFC; border-radius: 12px;
  padding: 18px 20px; text-align: left; margin: 18px 0;
  h4 { font-size: 14px; font-weight: 800; margin-bottom: 12px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #4A5565; }
  .row b { color: #0F172A; }
  .price { background: ${({ theme }) => theme.gradients.brand}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }
`

export default function BookingSuccessPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [b, setB] = useState(null)
  const [h, setH] = useState(null)

  useEffect(() => {
    bookingApi.get(id).then(async (book) => {
      setB(book)
      try { setH(await housingApi.get(book.housing_id)) } catch {}
    }).catch(() => {})
  }, [id])

  return (
    <PageBg>
      <Header title="Бронирование подтверждено" />
      <PageInner>
        <SuccessCard>
          <Tick>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
            </svg>
          </Tick>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Бронирование подтверждено!</h2>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Ваше бронирование успешно оформлено. Подробная информация отправлена на вашу электронную почту.
          </p>

          <Details>
            <h4>Детали бронирования</h4>
            <div className="row"><span>Объект:</span><b>{h?.title || '—'}</b></div>
            <div className="row"><span>Даты:</span><b>{b ? formatDateRange(b.check_in, b.check_out) : '—'}</b></div>
            <div className="row"><span>Гостей:</span><b>{b?.guests_count}</b></div>
            <div className="row"><span>Итого оплачено:</span><b className="price">{b ? `${formatPrice(b.total_price)} ₽` : '—'}</b></div>
          </Details>

          <PrimaryButton as={Link} to="/app/bookings" style={{ width: '100%' }}>Перейти к моим бронированиям</PrimaryButton>
          <div style={{ marginTop: 12 }}>
            <a onClick={() => nav('/app')} style={{ color: '#2A8DFF', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>← Вернуться на главную</a>
          </div>
          <p style={{ marginTop: 14, color: '#6B7280', fontSize: 12 }}>Доступ к объекту будет предоставлен за 24 часа до заезда</p>
        </SuccessCard>
      </PageInner>
    </PageBg>
  )
}
