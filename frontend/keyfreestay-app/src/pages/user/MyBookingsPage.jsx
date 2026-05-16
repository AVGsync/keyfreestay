import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { bookingApi, housingApi } from '../../api/client'
import { PageBg, PageInner, Card, BackLink, PageTitle, GradientTabs, GradientTab, Badge } from '../../components/UI'
import { formatDateRange, fixUrl } from '../../utils/format'

const HeadRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
  @media (max-width: 640px) { flex-direction: column; align-items: flex-start; gap: 12px; }
`
const BookCard = styled(Card)`
  display: flex; gap: 16px; align-items: center;
  margin-bottom: 16px; padding: 16px;
  cursor: pointer;
  .img { width: 90px; height: 70px; border-radius: 12px; background: linear-gradient(135deg, #FCD9B6, #F5B0E1); overflow: hidden; flex: none;
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  .body { flex: 1; min-width: 0; }
  h3 { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
  .d { font-size: 13px; color: #6B7280; margin-bottom: 6px; }
  &:hover { transform: translateY(-1px); box-shadow: ${({ theme }) => theme.shadows.md}; }
`

const STATUS_LABEL = {
  pending: { label: 'Предстоящее', variant: 'info' },
  confirmed: { label: 'Подтверждено', variant: 'success' },
  cancelled: { label: 'Отменено', variant: 'danger' },
  completed: { label: 'Завершено', variant: 'default' }
}

export default function MyBookingsPage() {
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [titles, setTitles] = useState({})
  const [tab, setTab] = useState('active')

  useEffect(() => {
    bookingApi.list().then(async (r) => {
      const arr = r.items || []
      setItems(arr)
      const uniq = Array.from(new Set(arr.map(b => b.housing_id)))
      const map = {}
      await Promise.all(uniq.map(id => housingApi.get(id).then(h => { map[id] = h }).catch(() => {})))
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
      <Header title="Мои бронирования" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <HeadRow>
          <PageTitle>Мои бронирования</PageTitle>
          <GradientTabs>
            <GradientTab $active={tab === 'active'} onClick={() => setTab('active')}>Активные</GradientTab>
            <GradientTab $active={tab === 'past'} onClick={() => setTab('past')}>Прошедшие</GradientTab>
          </GradientTabs>
        </HeadRow>

        {list.length === 0 && <Card>Бронирований пока нет</Card>}
        {list.map(b => {
          const h = titles[b.housing_id]
          const tag = STATUS_LABEL[b.status] || { label: b.status, variant: 'default' }
          return (
            <BookCard key={b.id} onClick={() => nav(`/app/p/${b.housing_id}`)}>
              <div className="img">{h?.images?.[0]?.ImageURL && <img src={fixUrl(h.images[0].ImageURL)} alt="" />}</div>
              <div className="body">
                <h3>{h?.title || 'Объект'}</h3>
                <div className="d">{formatDateRange(b.check_in, b.check_out)}</div>
                <Badge $variant={tag.variant}>{tag.label}</Badge>
              </div>
            </BookCard>
          )
        })}
      </PageInner>
    </PageBg>
  )
}
