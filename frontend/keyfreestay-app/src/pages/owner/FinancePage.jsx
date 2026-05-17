import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { bookingApi } from '../../api/client'
import { PageBg, PageInner, Card, BackLink, GradientTabs, GradientTab, Badge } from '../../components/UI'
import { formatPrice, formatDate } from '../../utils/format'

const Stats = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  margin-bottom: 16px;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`
const StatBox = styled(Card)`
  .ic { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;
    color: ${({ $color }) => $color || '#0F766E'}; font-size: 18px; margin-bottom: 8px; }
  .v { font-size: 28px; font-weight: 800; color: ${({ $color }) => $color || '#0F172A'}; }
  .l { font-size: 13px; color: #6B7280; margin-top: 4px; }
`
const HistoryItem = styled.div`
  display: grid; grid-template-columns: 1fr auto; align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #E5E7EB;
  &:last-child { border-bottom: none; }
  .a { font-weight: 800; font-size: 14px; display: inline-flex; gap: 10px; align-items: center; }
  .d { font-size: 12px; color: #6B7280; margin-top: 4px; }
  a { color: ${({ theme }) => theme.colors.primarySolid}; font-weight: 600; font-size: 13px; cursor: pointer; }
`
const Banner = styled.div`
  background: ${({ theme }) => theme.gradients.brand};
  color: #fff; border-radius: 16px;
  padding: 20px 24px;
  h4 { font-size: 16px; font-weight: 800; margin-bottom: 6px; display: inline-flex; gap: 8px; }
  p { font-size: 13px; opacity: 0.92; }
`
const ModalBg = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.4);
  display: grid; place-items: center; z-index: 50; padding: 20px;
`
const Modal = styled(Card)`
  max-width: 460px; width: 100%; padding: 24px;
  position: relative;
  .close { position: absolute; top: 16px; right: 16px; background: none; border: none; cursor: pointer; font-size: 22px; color: #94A3B8; }
  h3 { font-size: 16px; font-weight: 800; margin-bottom: 16px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E7EB; font-size: 14px;
    &:last-of-type { border-bottom: none; }
    .l { color: #4A5565; } .v { font-weight: 700; }
  }
  .sub { font-size: 13px; font-weight: 700; margin: 12px 0 8px; color: #0F172A; }
  .bk { background: #EFF6FF; border-radius: 10px; padding: 12px;
    display: grid; grid-template-columns: 1fr auto; gap: 8px;
    margin-bottom: 8px;
    .t { font-weight: 700; font-size: 13px; }
    .s { font-size: 12px; color: #6B7280; }
    .v { font-weight: 800; font-size: 14px; }
  }
`

const PAYOUTS = (net) => [
  { id: 'p1', amount: net, status: 'pending', date: '5 апреля 2026', count: 2, bookings: [
    { title: 'Современная квартира в центре', who: 'Иван Иванов', amount: Math.round(net * 0.65) },
    { title: 'Уютная студия у метро', who: 'Мария Петрова', amount: net - Math.round(net * 0.65) }
  ] },
  { id: 'p2', amount: Math.round(net * 0.55), status: 'done', date: '1 апреля 2026', count: 2, bookings: [
    { title: 'Современная квартира в центре', who: 'Анна Смирнова', amount: Math.round(net * 0.30) },
    { title: 'Просторная 2-комнатная', who: 'Дмитрий Козлов', amount: Math.round(net * 0.25) }
  ] }
]

export default function FinancePage() {
  const nav = useNavigate()
  const [period, setPeriod] = useState('month')
  const [bookings, setBookings] = useState([])
  const [det, setDet] = useState(null)

  useEffect(() => {
    bookingApi.list().then(r => setBookings(r.items || [])).catch(() => {})
  }, [])

  const factor = period === 'year' ? 12 : period === 'quarter' ? 3 : 1
  const gross = useMemo(() => (bookings.reduce((s, b) => s + (b.total_price || 0), 0) || 52500) * factor, [bookings, factor])
  const fee = Math.round(gross * 0.10)
  const net = gross - fee
  const payouts = useMemo(() => PAYOUTS(net), [net])

  return (
    <PageBg>
      <Header title="Финансы" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>

        <Card style={{ marginBottom: 16 }}>
          <GradientTabs style={{ width: '100%' }}>
            <GradientTab style={{ flex: 1 }} $active={period === 'month'} onClick={() => setPeriod('month')}>Месяц</GradientTab>
            <GradientTab style={{ flex: 1 }} $active={period === 'quarter'} onClick={() => setPeriod('quarter')}>Квартал</GradientTab>
            <GradientTab style={{ flex: 1 }} $active={period === 'year'} onClick={() => setPeriod('year')}>Год</GradientTab>
          </GradientTabs>
        </Card>

        <Stats className="reveal">
          <StatBox><div className="ic" style={{ color: '#16A34A' }}>📈</div><div className="v">{formatPrice(gross)} ₽</div><div className="l">Общий доход</div></StatBox>
          <StatBox><div className="ic" style={{ color: '#F97316' }}>$</div><div className="v">{formatPrice(fee)} ₽</div><div className="l">Комиссия платформы</div></StatBox>
          <StatBox $color="#16A34A"><div className="ic" style={{ color: '#16A34A' }}>$</div><div className="v" style={{ color: '#16A34A' }}>{formatPrice(net)} ₽</div><div className="l">Чистый доход</div></StatBox>
        </Stats>

        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>История выплат</h3>
          {payouts.map(p => (
            <HistoryItem key={p.id}>
              <div>
                <div className="a">{formatPrice(p.amount)} ₽ <Badge $variant={p.status === 'pending' ? 'warning' : 'success'}>{p.status === 'pending' ? 'В обработке' : 'Выполнено'}</Badge></div>
                <div className="d">{p.date}</div>
              </div>
              <a onClick={() => setDet(p)}>{p.count} бронирований →</a>
            </HistoryItem>
          ))}
        </Card>

        <Banner>
          <h4>ℹ Информация о выплатах</h4>
          <p>Выплаты производятся автоматически каждые 7 дней после завершения бронирования. Средства поступают на привязанную карту в течение 1-3 рабочих дней.</p>
        </Banner>
      </PageInner>

      {det && (
        <ModalBg onClick={() => setDet(null)}>
          <Modal onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setDet(null)}>×</button>
            <h3>Детали выплаты</h3>
            <div className="row"><span className="l">Дата выплаты:</span><span className="v">{det.date}</span></div>
            <div className="row"><span className="l">Сумма выплаты:</span><span className="v" style={{ color: '#16A34A' }}>{formatPrice(det.amount)} ₽</span></div>
            <div className="row"><span className="l">Статус:</span><span className="v"><Badge $variant={det.status === 'pending' ? 'warning' : 'success'}>{det.status === 'pending' ? 'В обработке' : 'Выполнено'}</Badge></span></div>
            <div className="sub">Бронирования ({det.count})</div>
            {det.bookings.map((b, i) => (
              <div className="bk" key={i}>
                <div>
                  <div className="t">{b.title} 🏙</div>
                  <div className="s">{b.who}</div>
                </div>
                <div className="v">{formatPrice(b.amount)} ₽</div>
              </div>
            ))}
          </Modal>
        </ModalBg>
      )}
    </PageBg>
  )
}
