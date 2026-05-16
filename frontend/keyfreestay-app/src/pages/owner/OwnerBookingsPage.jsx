import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { bookingApi, housingApi } from '../../api/client'
import PrimaryButton from '../../components/PrimaryButton'
import { PageBg, PageInner, Card, BackLink, PageTitle, GradientTabs, GradientTab, Badge } from '../../components/UI'
import { formatDateRange, formatPrice, diffNights, fixUrl } from '../../utils/format'

const HeadRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
  @media (max-width: 640px) { flex-direction: column; align-items: flex-start; gap: 12px; }
`
const Row = styled(Card)`
  display: grid; grid-template-columns: 100px 1fr auto; gap: 16px; align-items: center;
  margin-bottom: 16px;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
  .img { width: 100px; height: 80px; border-radius: 12px; background: linear-gradient(135deg, #FCD9B6, #F5B0E1); overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
    @media (max-width: 760px) { width: 100%; height: 140px; }
  }
  .body h3 { font-size: 16px; font-weight: 800; display: inline-flex; gap: 10px; align-items: center; margin-bottom: 6px; }
  .body .meta { display: grid; gap: 4px; font-size: 13px; color: #4A5565; }
  .body .meta .ico { color: #94A3B8; display: inline-block; width: 16px; }
  .body .price { color: #16A34A; font-weight: 800; font-size: 16px; margin-top: 4px; }
  .act { display: flex; flex-direction: column; gap: 8px; min-width: 180px; }
`
const Ghost = styled.button`
  background: #F1F5F9; border: none; border-radius: 12px;
  padding: 12px 16px; cursor: pointer;
  font-weight: 600; font-size: 13px; color: #0F172A;
`

const STATUS = {
  pending: { label: 'Предстоящее', variant: 'info' },
  confirmed: { label: 'Подтверждено', variant: 'success' },
  cancelled: { label: 'Отменено', variant: 'danger' },
  completed: { label: 'Завершено', variant: 'default' }
}

export default function OwnerBookingsPage() {
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [titles, setTitles] = useState({})
  const [tab, setTab] = useState('active')

  useEffect(() => {
    bookingApi.list().then(async (r) => {
      const arr = r.items || []
      setItems(arr)
      const ids = Array.from(new Set(arr.map(b => b.housing_id)))
      const map = {}
      await Promise.all(ids.map(id => housingApi.get(id).then(h => { map[id] = h }).catch(() => {})))
      setTitles(map)
    }).catch(() => {})
  }, [])

  const list = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0)
    return items.filter(b => {
      const past = new Date(b.check_out) < today || b.status === 'completed' || b.status === 'cancelled'
      return tab === 'active' ? !past : past
    })
  }, [items, tab])

  return (
    <PageBg>
      <Header title="Бронирования" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <HeadRow>
          <PageTitle>Бронирования</PageTitle>
          <GradientTabs>
            <GradientTab $active={tab === 'active'} onClick={() => setTab('active')}>Активные</GradientTab>
            <GradientTab $active={tab === 'past'} onClick={() => setTab('past')}>История</GradientTab>
          </GradientTabs>
        </HeadRow>

        {list.length === 0 && <Card>Пока нет бронирований</Card>}
        {list.map(b => {
          const h = titles[b.housing_id]
          const tag = STATUS[b.status] || { label: b.status, variant: 'default' }
          return (
            <Row key={b.id}>
              <div className="img">{h?.images?.[0]?.ImageURL && <img src={fixUrl(h.images[0].ImageURL)} alt="" />}</div>
              <div className="body">
                <h3>{h?.title || 'Объект'} <Badge $variant={tag.variant}>{tag.label}</Badge></h3>
                <div className="meta">
                  <div><span className="ico">👤</span> Иван Иванов</div>
                  <div><span className="ico">📞</span> +7 (999) 123-45-67</div>
                  <div><span className="ico">📅</span> {formatDateRange(b.check_in, b.check_out)} ({diffNights(b.check_in, b.check_out)} ночей)</div>
                </div>
                <div className="price">{formatPrice(b.total_price)} ₽</div>
              </div>
              <div className="act">
                <PrimaryButton onClick={() => nav(`/owner/bookings/${b.id}`)} style={{ padding: '10px 16px', fontSize: 13 }}>Подробнее</PrimaryButton>
                <Ghost>Написать арендатору</Ghost>
              </div>
            </Row>
          )
        })}
      </PageInner>
    </PageBg>
  )
}
