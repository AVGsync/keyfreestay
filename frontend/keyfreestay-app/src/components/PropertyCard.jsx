import styled from 'styled-components'
import { Link } from 'react-router-dom'
import PrimaryButton from './PrimaryButton'
import { Badge } from './UI'
import { formatPrice, mapAmenityLabel, fixUrl } from '../utils/format'

const Card = styled.article`
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 160ms ease, box-shadow 160ms ease;
  &:hover { transform: translateY(-2px); box-shadow: ${({ theme }) => theme.shadows.md}; }
`
const ImgWrap = styled.div`
  position: relative; aspect-ratio: 4 / 3; overflow: hidden;
  background: linear-gradient(135deg, #DCE9F9 0%, #C8DDEF 100%);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`
const Fav = styled.button`
  position: absolute; top: 12px; right: 12px;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.95);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: ${({ $on, theme }) => $on ? theme.colors.brandGreen : theme.colors.textSecondary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  &:hover { transform: scale(1.05); }
`
const StatusWrap = styled.div`
  position: absolute; top: 12px; right: 12px;
`
const Body = styled.div`
  padding: 14px 14px 16px;
  display: flex; flex-direction: column; flex: 1;
`
const Title = styled.h3`
  font-size: 15px; font-weight: 700; color: ${({ theme }) => theme.colors.textPrimary};
`
const Address = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 4px;
`
const Row = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 10px;
`
const Rating = styled.span`
  font-size: 13px; font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: inline-flex; align-items: center; gap: 4px;
  &::before { content: '★'; color: #F59E0B; }
`
const Price = styled.span`
  font-weight: 700; font-size: 15px;
`
const Actions = styled.div`
  display: flex; gap: 8px; margin-top: 14px;
`
const SmallBtn = styled(Link)`
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.bgSoft};
  color: ${({ theme }) => theme.colors.primarySolid};
  font-size: 13px; font-weight: 600;
  &:hover { background: #EFF3F8; }
`
const Heart = ({ on }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.7l-1.06-1.1a5.5 5.5 0 1 0-7.78 7.8l1.06 1.05L12 21.23l7.78-7.78 1.06-1.05a5.5 5.5 0 0 0 0-7.78Z" />
  </svg>
)

const STATUS_LABEL = {
  published: { label: 'Опубликовано', variant: 'success' },
  draft: { label: 'Черновик', variant: 'default' },
  unpublished: { label: 'Снято', variant: 'warning' }
}

export default function PropertyCard({ item, variant = 'tenant', favorited = false, onFavorite }) {
  if (!item) return null
  const tag = STATUS_LABEL[item.status]
  const img = fixUrl(item.thumbnail_url || item.image)
  const title = item.title || 'Без названия'
  const price = item.price_per_night
  return (
    <Card>
      <ImgWrap>
        {img ? <img src={img} alt={title} loading="lazy" /> : null}
        {variant === 'tenant' && (
          <Fav $on={favorited} onClick={(e) => { e.preventDefault(); onFavorite?.(item.id) }} title="В избранное">
            <Heart on={favorited} />
          </Fav>
        )}
        {variant === 'owner' && tag && (
          <StatusWrap><Badge $variant={tag.variant}>{tag.label}</Badge></StatusWrap>
        )}
      </ImgWrap>
      <Body>
        <Title>{title}</Title>
        <Address>{item.address || '—'}</Address>
        <Row>
          <Rating>
            {item.rating_avg != null ? Number(item.rating_avg).toFixed(1) : '—'}
            {item.rating_count ? ` (${item.rating_count})` : ''}
          </Rating>
          <Price>{price != null ? `${formatPrice(price)} ₽/ноч.` : '—'}</Price>
        </Row>

        {variant === 'tenant' ? (
          <div style={{ marginTop: 14 }}>
            <PrimaryButton as={Link} to={`/app/p/${item.id}`} style={{ width: '100%', padding: '10px', fontSize: 14 }}>
              Подробнее
            </PrimaryButton>
          </div>
        ) : (
          <Actions>
            <SmallBtn to={`/owner/p/${item.id}`}>✏ Редактировать</SmallBtn>
            <SmallBtn to={`/owner/p/${item.id}/stats`}>📊 Статистика</SmallBtn>
          </Actions>
        )}
      </Body>
    </Card>
  )
}

export { mapAmenityLabel }
