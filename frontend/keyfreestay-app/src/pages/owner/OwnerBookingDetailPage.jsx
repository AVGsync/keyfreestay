import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { bookingApi, housingApi } from '../../api/client'
import PrimaryButton from '../../components/PrimaryButton'
import { PageBg, PageInner, Card, BackLink, Badge } from '../../components/UI'
import { formatDateRange, formatPrice, diffNights, fixUrl } from '../../utils/format'

const Hero = styled.div`
  height: 220px; border-radius: 18px; overflow: hidden;
  background: linear-gradient(135deg, #FCD9B6, #F5B0E1);
  margin-bottom: 16px;
  img { width: 100%; height: 100%; object-fit: cover; }
`
const Sec = styled(Card)`
  margin-bottom: 16px;
  h3 { font-size: 16px; font-weight: 800; margin-bottom: 14px; display: inline-flex; gap: 8px; align-items: center; }
`
const Title = styled.h2`
  font-size: 20px; font-weight: 800; margin: 4px 0 4px;
`
const DateLine = styled.div`
  font-size: 13px; color: #6B7280; margin-bottom: 16px;
`
const TenantCard = styled(Card)`
  margin-bottom: 16px;
  display: grid; grid-template-columns: 48px 1fr auto; gap: 14px; align-items: center;
  .av { width: 48px; height: 48px; border-radius: 50%;
    background: ${({ theme }) => theme.gradients.brand};
    color: #fff; display: inline-flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 800;
  }
  h4 { font-size: 15px; font-weight: 800; }
  .ph { font-size: 12px; color: #6B7280; margin-top: 2px; }
  @media (max-width: 640px) {
    grid-template-columns: 48px 1fr;
    & > a, & > button { grid-column: 1 / -1; width: 100%; }
  }
`
const Row = styled.div`
  display: flex; justify-content: space-between; padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSoft};
  &:first-of-type { border-top: none; padding-top: 0; }
  .l { display: inline-flex; gap: 8px; align-items: center; color: #4A5565; font-size: 14px; }
  .v { font-weight: 800; font-size: 14px; }
`
const AccessGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px;
  @media (max-width: 540px) { grid-template-columns: 1fr; }
  button { padding: 14px; border: none; border-radius: 12px; cursor: pointer;
    font-family: inherit; font-weight: 700; font-size: 14px;
  }
  .grant { background: linear-gradient(90deg, #05DF72, #2A8DFF); color: #fff; }
  .revoke { background: #F1F5F9; color: #0F172A; }
`
const Info = styled.div`
  background: ${({ theme }) => theme.gradients.brand};
  color: #fff; border-radius: 16px; padding: 18px 22px;
  h4 { font-size: 14px; font-weight: 800; margin-bottom: 10px; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  li { font-size: 12px; opacity: 0.95; padding-left: 14px; position: relative;
    &::before { content: '•'; position: absolute; left: 0; }
  }
`

const STATUS = {
  pending: 'Предстоящее',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено'
}

export default function OwnerBookingDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [b, setB] = useState(null)
  const [h, setH] = useState(null)
  const [access, setAccess] = useState(false)

  useEffect(() => {
    bookingApi.get(id).then(async (bk) => {
      setB(bk)
      try { setH(await housingApi.get(bk.housing_id)) } catch {}
    }).catch(() => {})
  }, [id])

  if (!b) return <PageBg><Header title="Бронирования" /><PageInner>Загрузка…</PageInner></PageBg>

  const big = h?.images?.[0]?.ImageURL
  const status = STATUS[b.status] || b.status

  return (
    <PageBg>
      <Header title="Бронирования" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Hero>{big && <img src={fixUrl(big)} alt="" />}</Hero>

          <Title>{h?.title || 'Объект'} 🏙</Title>
          <DateLine>📅 {formatDateRange(b.check_in, b.check_out)} ({diffNights(b.check_in, b.check_out)} ночей)</DateLine>

          <TenantCard>
            <div className="av">И</div>
            <div>
              <h4>Информация об арендаторе</h4>
              <div className="ph">Иван Иванов</div>
              <div className="ph">📞 +7 (999) 123-45-67</div>
            </div>
            <PrimaryButton style={{ padding: '12px 18px', fontSize: 13 }}>Связаться с арендатором</PrimaryButton>
          </TenantCard>

          <Sec>
            <h3>Детали бронирования</h3>
            <Row><span className="l">👥 Количество гостей</span><span className="v">{b.guests_count}</span></Row>
            <Row><span className="l">🌙 Количество ночей</span><span className="v">{diffNights(b.check_in, b.check_out)}</span></Row>
            <Row><span className="l">$ Сумма за бронирование</span><span className="v" style={{ color: '#16A34A' }}>{formatPrice(b.total_price)} ₽</span></Row>
            <Row><span className="l">● Статус</span><span className="v"><Badge $variant="info">{status}</Badge></span></Row>
          </Sec>

          <Sec>
            <h3>Управление доступом</h3>
            <Row><span className="l">Статус доступа:</span><span className="v" style={{ color: access ? '#16A34A' : '#94A3B8' }}>{access ? 'Доступ предоставлен' : 'Доступ не предоставлен'}</span></Row>
            <AccessGrid>
              <button className="grant" onClick={() => setAccess(true)}>Предоставить доступ</button>
              <button className="revoke" onClick={() => setAccess(false)}>Отозвать доступ</button>
            </AccessGrid>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 12 }}>Управление доступом позволяет контролировать возможность арендатора входить в помещение</div>
          </Sec>

          <Info>
            <h4>ℹ Важная информация</h4>
            <ul>
              <li>Свяжитесь с арендатором для уточнения деталей заезда и выезда</li>
              <li>Управляйте доступом в соответствии с датами бронирования</li>
              <li>После завершения бронирования не забудьте попросить арендатора оставить отзыв</li>
            </ul>
          </Info>
        </div>
      </PageInner>
    </PageBg>
  )
}
