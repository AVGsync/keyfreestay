import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import PrimaryButton from '../../components/PrimaryButton'
import Calendar from '../../components/Calendar'
import { housingApi } from '../../api/client'
import { PageBg, PageInner, Card, BackLink, Label, Input } from '../../components/UI'
import { formatPrice, isoDate, formatDate, diffNights, fixUrl } from '../../utils/format'

const PropRow = styled(Card)`
  display: flex; gap: 16px; align-items: center;
  margin-bottom: 16px;
  .img { width: 100px; height: 80px; border-radius: 12px; background: linear-gradient(135deg, #FCD9B6, #F5B0E1); overflow: hidden; flex: none;
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  h3 { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
  .r { color: #6B7280; font-size: 13px; }
  @media (max-width: 540px) {
    .img { width: 72px; height: 56px; }
    h3 { font-size: 15px; }
  }
`
const TwoCol = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`
const SubTitle = styled.h3`
  font-size: 16px; font-weight: 700; margin-bottom: 14px;
  display: inline-flex; gap: 8px; align-items: center;
`
const DateGroup = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  position: relative;
`
const DateField = styled.div`
  position: relative;
  small { display: block; font-size: 12px; color: #6B7280; margin-bottom: 4px; }
`
const GuestsRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 4px;
`
const Stepper = styled.div`
  display: inline-flex; align-items: center; gap: 16px;
  button { width: 32px; height: 32px; border-radius: 50%; border: none; background: #F1F5F9; cursor: pointer; font-size: 18px; color: #475569; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  .n { font-weight: 700; font-size: 16px; }
`
const Totals = styled(Card)`
  margin-bottom: 24px;
  h3 { font-size: 16px; font-weight: 800; margin-bottom: 12px; }
  .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #4A5565; }
  .total { display: flex; justify-content: space-between; padding-top: 10px; margin-top: 6px;
    border-top: 1px solid #E5E7EB; font-size: 16px; }
  .total b { font-weight: 800; }
  .total .p { background: ${({ theme }) => theme.gradients.brand}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 20px; }
`
const SERVICE_FEE = 500

export default function BookingPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [item, setItem] = useState(null)
  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [guests, setGuests] = useState(1)
  const [showCal1, setShowCal1] = useState(false)
  const [showCal2, setShowCal2] = useState(false)
  const wrap = useRef(null)

  useEffect(() => {
    housingApi.get(id).then(setItem).catch(() => {})
  }, [id])

  useEffect(() => {
    const h = (e) => { if (wrap.current && !wrap.current.contains(e.target)) { setShowCal1(false); setShowCal2(false) } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const nights = diffNights(checkIn, checkOut)
  const price = item?.price_per_night || 0
  const subtotal = price * nights
  const total = nights ? subtotal + SERVICE_FEE : 0
  const canBook = item && checkIn && checkOut && nights > 0 && guests > 0 && guests <= (item.max_guests || 50)

  function proceed() {
    if (!canBook) return
    const params = new URLSearchParams({
      housing_id: item.id,
      check_in: isoDate(checkIn),
      check_out: isoDate(checkOut),
      guests_count: String(guests)
    })
    nav(`/app/p/${item.id}/pay?${params.toString()}`)
  }

  return (
    <PageBg>
      <Header title="Бронирование" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>

        <PropRow>
          <div className="img">{item?.images?.[0]?.ImageURL && <img src={fixUrl(item.images[0].ImageURL)} alt="" />}</div>
          <div>
            <h3>{item?.title || 'Объект'}</h3>
            <div className="r">★ {item?.rating_avg?.toFixed?.(1) || '—'} ({item?.rating_count || 0} отзывов)</div>
          </div>
        </PropRow>

        <TwoCol ref={wrap}>
          <Card>
            <SubTitle>📅 Выберите даты</SubTitle>
            <DateGroup>
              <DateField>
                <small>Дата заезда</small>
                <Input readOnly value={checkIn ? formatDate(checkIn) : ''} placeholder="00.00.0000" onFocus={() => { setShowCal1(true); setShowCal2(false) }} />
                {showCal1 && <Calendar value={checkIn} onChange={(d) => { setCheckIn(d); setShowCal1(false); setShowCal2(true) }} />}
              </DateField>
              <DateField>
                <small>Дата выезда</small>
                <Input readOnly value={checkOut ? formatDate(checkOut) : ''} placeholder="00.00.0000" onFocus={() => { setShowCal2(true); setShowCal1(false) }} />
                {showCal2 && <Calendar value={checkOut} min={checkIn || new Date()} onChange={(d) => { setCheckOut(d); setShowCal2(false) }} />}
              </DateField>
            </DateGroup>
          </Card>
          <Card>
            <SubTitle>👥 Количество гостей</SubTitle>
            <GuestsRow>
              <span>Гостей</span>
              <Stepper>
                <button onClick={() => setGuests(g => Math.max(1, g - 1))} disabled={guests <= 1}>−</button>
                <span className="n">{guests}</span>
                <button onClick={() => setGuests(g => Math.min(item?.max_guests || 50, g + 1))} disabled={guests >= (item?.max_guests || 50)}>+</button>
              </Stepper>
            </GuestsRow>
          </Card>
        </TwoCol>

        <Totals>
          <h3>Детали стоимости</h3>
          <div className="row"><span>{formatPrice(price)} ₽ × {nights} ночей</span><span>{formatPrice(subtotal)} ₽</span></div>
          <div className="row"><span>Сервисный сбор</span><span>{formatPrice(SERVICE_FEE)} ₽</span></div>
          <div className="total"><b>Итого</b><span className="p">{formatPrice(total)} ₽</span></div>
        </Totals>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PrimaryButton onClick={proceed} disabled={!canBook}>Подтвердить и оплатить</PrimaryButton>
        </div>
      </PageInner>
    </PageBg>
  )
}
