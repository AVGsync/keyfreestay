import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { housingApi } from '../../api/client'
import PrimaryButton from '../../components/PrimaryButton'
import { useFavorites } from '../../utils/favorites'
import { PageBg, PageInner, Card, BackLink } from '../../components/UI'
import { formatPrice, mapAmenityLabel, COMFORTS, SMART, fixUrl } from '../../utils/format'

const Gallery = styled.div`
  display: grid; gap: 12px;
  grid-template-columns: 2fr 1fr;
  height: 480px;
  margin-bottom: 24px;
  @media (max-width: 760px) { grid-template-columns: 1fr; height: auto; }
`
const Big = styled.div`
  background: linear-gradient(135deg, #DCE9F9 0%, #C8DDEF 100%);
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden; position: relative;
  img { width: 100%; height: 100%; object-fit: cover; }
`
const Arrow = styled.button`
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.9); border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  color: #0F172A; font-size: 18px; font-weight: 700;
  box-shadow: 0 4px 12px rgba(15,23,42,0.1);
  &.l { left: 16px; }
  &.r { right: 16px; }
`
const Mini = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12px;
  min-height: 0;
  @media (max-width: 760px) { grid-template-rows: 180px 180px; }
  > div {
    background: linear-gradient(135deg, #F5E1D1 0%, #DCE9F9 100%);
    border-radius: ${({ theme }) => theme.radii.lg};
    overflow: hidden;
    min-height: 0;
  }
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`
const FavTop = styled.button`
  position: absolute; top: 16px; right: 16px;
  background: rgba(255,255,255,0.95);
  border: none; border-radius: 999px; padding: 8px 14px;
  display: inline-flex; gap: 6px; align-items: center; cursor: pointer;
  color: ${({ $on, theme }) => $on ? theme.colors.brandGreen : theme.colors.textSecondary};
  font-weight: 600; font-size: 13px;
`
const TitleCard = styled(Card)`
  margin-bottom: 16px;
  h2 { font-size: 20px; font-weight: 800; }
  .r { display: inline-flex; gap: 6px; color: ${({ theme }) => theme.colors.textMuted}; font-size: 14px; margin-top: 6px; align-items: center; }
  .r b { color: #0F172A; }
`
const SectionTitle = styled.h3`
  font-size: 16px; font-weight: 800; margin-bottom: 16px;
`
const AmenityGrid = styled.div`
  display: grid; gap: 12px;
  grid-template-columns: repeat(3, 1fr);
  @media (max-width: 620px) { grid-template-columns: repeat(2, 1fr); }
`
const AmenityCell = styled.div`
  background: linear-gradient(135deg, #ECFDF5 0%, #DBEAFE 100%);
  border-radius: 12px;
  padding: 18px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  text-align: center;
  .ic { color: ${({ theme }) => theme.colors.primarySolid}; }
  .lbl { font-size: 13px; font-weight: 600; color: #0F172A; }
`
const MapBox = styled.div`
  height: 280px; border-radius: ${({ theme }) => theme.radii.md};
  background:
    repeating-linear-gradient(0deg, rgba(180,200,220,0.20) 0 1px, transparent 1px 38px),
    repeating-linear-gradient(90deg, rgba(180,200,220,0.20) 0 1px, transparent 1px 38px),
    linear-gradient(180deg, #E8EFF7 0%, #DCE5F0 100%);
  position: relative;
  &::after {
    content: ''; position: absolute;
    width: 32px; height: 40px;
    left: 50%; top: 50%; transform: translate(-50%, -100%);
    background: ${({ theme }) => theme.colors.primarySolid};
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 40'%3E%3Cpath d='M16 0C7.16 0 0 7.16 0 16c0 11 16 24 16 24s16-13 16-24C32 7.16 24.84 0 16 0Zm0 22a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z' fill='black'/%3E%3C/svg%3E") no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 40'%3E%3Cpath d='M16 0C7.16 0 0 7.16 0 16c0 11 16 24 16 24s16-13 16-24C32 7.16 24.84 0 16 0Zm0 22a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z' fill='black'/%3E%3C/svg%3E") no-repeat center / contain;
  }
`
const ReviewsHead = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
  h3 { font-size: 16px; font-weight: 800; }
  a { color: ${({ theme }) => theme.colors.primarySolid}; font-size: 13px; font-weight: 600; cursor: pointer; }
`
const BottomBar = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  gap: 16px; padding: 0 4px;
  @media (max-width: 540px) {
    flex-direction: column; align-items: stretch;
    a { width: 100%; }
  }
`
const ReviewRow = styled.div`
  display: grid; grid-template-columns: 32px 1fr; gap: 12px;
  padding: 14px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSoft};
  &:first-of-type { border-top: none; }
  .av { width: 32px; height: 32px; border-radius: 50%;
    background: ${({ theme }) => theme.gradients.brand};
    color: #fff; display: inline-flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; flex: none;
  }
  .head { display: flex; gap: 8px; align-items: center; }
  .n { font-weight: 700; font-size: 14px; }
  .d { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; }
  .s { color: #F59E0B; font-size: 13px; margin-top: 4px; }
  .t { font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 4px; line-height: 1.5; }
`
const Heart = ({ on }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.7l-1.06-1.1a5.5 5.5 0 1 0-7.78 7.8l1.06 1.05L12 21.23l7.78-7.78 1.06-1.05a5.5 5.5 0 0 0 0-7.78Z" />
  </svg>
)

const REVIEW_SAMPLE = [
  { n: 'Анна Смирнова', d: '15 марта 2026', s: 5, t: 'Отличная квартира! Всё было чисто, удобно расположена.' },
  { n: 'Дмитрий Иванов', d: '10 марта 2026', s: 4, t: 'Хорошее место, удобное расположение. Немного шумно от дороги, но в целом всё отлично.' }
]

const ICON = {
  wifi: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5a10 10 0 0 1 14 0M2 8.5a16 16 0 0 1 20 0M8.5 16.5a5 5 0 0 1 7 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></svg>,
  kitchen: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11h18M5 11V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M7 11v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8M9 7h.01M12 7h.01" /></svg>,
  air_conditioner: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="6" rx="2" /><path d="M6 14v2M10 14v3M14 14v3M18 14v2" /></svg>,
  parking: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-1a1 1 0 0 1-1-1v-5l2-5h14l2 5v5a1 1 0 0 1-1 1h-1M5 17v2M19 17v2M5 17h14" /><circle cx="7" cy="14" r="1.5" fill="currentColor" /><circle cx="17" cy="14" r="1.5" fill="currentColor" /></svg>,
  washing_machine: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="12" cy="13" r="4" /><circle cx="7" cy="6" r="0.5" fill="currentColor" /><circle cx="10" cy="6" r="0.5" fill="currentColor" /></svg>,
  heating: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-3 3-3 6 0 9s3 6 0 9M8 11c-2 2-2 5 0 7M16 11c2 2 2 5 0 7" /></svg>,
  smart_lock: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15" r="1" fill="currentColor" /></svg>,
  smart_lighting: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 0-4 12.6V17h8v-2.4A7 7 0 0 0 12 2ZM9 21h6M10 17v4" /></svg>,
  smart_thermostat: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14V4a2 2 0 0 0-4 0v10a4 4 0 1 0 4 0Z" /></svg>,
  voice_assistant: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></svg>
}

export default function PropertyPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const fav = useFavorites()
  const [item, setItem] = useState(null)
  const [err, setErr] = useState('')
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    housingApi.get(id).then(setItem).catch(() => setErr('Объект не найден'))
  }, [id])

  if (err) return (<PageBg><Header /><PageInner>{err}</PageInner></PageBg>)
  if (!item) return (<PageBg><Header /><PageInner>Загрузка…</PageInner></PageBg>)

  const images = item.images || []
  const big = images[imgIdx] ? fixUrl(images[imgIdx].ImageURL) : null
  const mini = images.filter((_, i) => i !== imgIdx).slice(0, 4).map(i => fixUrl(i.ImageURL))
  const comforts = (item.amenities || []).filter(a => COMFORTS.includes(a))
  const smart = (item.amenities || []).filter(a => SMART.includes(a))
  const isFav = fav.has(item.id)

  function nextImg() { setImgIdx(i => (i + 1) % Math.max(1, images.length)) }
  function prevImg() { setImgIdx(i => (i - 1 + Math.max(1, images.length)) % Math.max(1, images.length)) }

  return (
    <PageBg>
      <Header />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>

        <Gallery>
          <Big>
            {big && <img src={big} alt="" />}
            {images.length > 1 && <Arrow className="l" onClick={prevImg}>‹</Arrow>}
            {images.length > 1 && <Arrow className="r" onClick={nextImg}>›</Arrow>}
            <FavTop $on={isFav} onClick={() => fav.toggle(item.id)}>
              <Heart on={isFav} /> {isFav ? 'В избранном' : 'Добавить в избранное'}
            </FavTop>
          </Big>
          <Mini>
            <div>{mini[0] && <img src={mini[0]} alt="" />}</div>
            <div>{mini[1] && <img src={mini[1]} alt="" />}</div>
            <div>{mini[2] && <img src={mini[2]} alt="" />}</div>
            <div>{mini[3] && <img src={mini[3]} alt="" />}</div>
          </Mini>
        </Gallery>

        <TitleCard>
          <h2>{item.title || 'Без названия'} 🏙</h2>
          <div className="r">★ <b>{item.rating_avg?.toFixed?.(1) || '—'}</b> ({item.rating_count} отзывов)</div>
        </TitleCard>

        <Card style={{ marginBottom: 16 }}>
          <SectionTitle>Описание</SectionTitle>
          <p style={{ color: '#4A5565', fontSize: 14, lineHeight: 1.6 }}>{item.description || 'Описание не указано'}</p>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <SectionTitle>Удобства</SectionTitle>
          {comforts.length ? (
            <AmenityGrid>
              {comforts.map(a => (
                <AmenityCell key={a}>
                  <span className="ic">{ICON[a] || '·'}</span>
                  <span className="lbl">{mapAmenityLabel(a)}</span>
                </AmenityCell>
              ))}
            </AmenityGrid>
          ) : <div style={{ color: '#6B7280' }}>—</div>}
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <SectionTitle>Умный дом</SectionTitle>
          {smart.length ? (
            <AmenityGrid>
              {smart.map(a => (
                <AmenityCell key={a}>
                  <span className="ic">{ICON[a] || '·'}</span>
                  <span className="lbl">{mapAmenityLabel(a)}</span>
                </AmenityCell>
              ))}
            </AmenityGrid>
          ) : <div style={{ color: '#6B7280' }}>—</div>}
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <SectionTitle>Расположение</SectionTitle>
          <MapBox />
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <ReviewsHead>
            <h3>Отзывы</h3>
            <a>Показать все отзывы ▾</a>
          </ReviewsHead>
          {REVIEW_SAMPLE.map((r, i) => (
            <ReviewRow key={i}>
              <div className="av">{r.n.charAt(0)}</div>
              <div>
                <div className="head"><span className="n">{r.n}</span><span className="d">{r.d}</span></div>
                <div className="s">{'★'.repeat(r.s)}{'☆'.repeat(5 - r.s)}</div>
                <div className="t">{r.t}</div>
              </div>
            </ReviewRow>
          ))}
        </Card>

        <BottomBar>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{formatPrice(item.price_per_night || 0)} ₽<span style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}> / ночь</span></div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>До {item.max_guests || '—'} гостей</div>
          </div>
          <PrimaryButton as={Link} to={`/app/p/${item.id}/book`}>Забронировать</PrimaryButton>
        </BottomBar>
      </PageInner>
    </PageBg>
  )
}
