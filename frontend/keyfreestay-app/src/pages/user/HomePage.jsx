import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Header from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import PropertyCard from '../../components/PropertyCard'
import { housingApi } from '../../api/client'
import { useFavorites } from '../../utils/favorites'
import PrimaryButton from '../../components/PrimaryButton'
import { GradientTabs, GradientTab, PageBg, PageInner, Card, Field, Label, Input, ErrorText } from '../../components/UI'
import { HOUSING_TYPES, COMFORTS, mapAmenityLabel } from '../../utils/format'

const TabsRow = styled.div`
  display: flex; justify-content: flex-start; margin: 16px 0 20px;
`
const Grid = styled.div`
  display: grid; gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 820px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`
const FilterPanel = styled(Card)`
  margin: 12px 0 0;
  position: relative;
`
const FilterHead = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
  h3 { font-size: 16px; font-weight: 800; color: #0F172A; display: inline-flex; gap: 8px; align-items: center; }
  a { color: ${({ theme }) => theme.colors.primarySolid}; font-size: 13px; font-weight: 500; cursor: pointer; }
  a:hover { text-decoration: underline; }
`
const FilterCols = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
  @media (max-width: 880px) { grid-template-columns: 1fr; gap: 18px; }
`
const FilterBlock = styled.div``
const BlockLabel = styled.div`
  font-size: 12px; color: #6B7280; margin-bottom: 8px;
`
const PriceRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
`
const ChipsRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
`
const Chip = styled.button`
  border: none; cursor: pointer; font-family: inherit;
  padding: 10px 18px;
  border-radius: 999px;
  background: ${({ $on, theme }) => $on ? theme.colors.primarySolid : theme.colors.bgSoft};
  color: ${({ $on }) => $on ? '#fff' : '#0F172A'};
  font-size: 13px; font-weight: 600;
`
const NumChip = styled(Chip)`
  min-width: 40px; padding: 10px 14px;
`
const ApplyRow = styled.div`
  display: flex; justify-content: flex-end; margin-top: 16px;
`
const ApplyBtn = styled(PrimaryButton)`
  padding: 10px 18px; font-size: 13px;
`
const MapBox = styled.div`
  position: relative;
  background:
    repeating-linear-gradient(0deg, rgba(180,200,220,0.20) 0 1px, transparent 1px 38px),
    repeating-linear-gradient(90deg, rgba(180,200,220,0.20) 0 1px, transparent 1px 38px),
    linear-gradient(180deg, #E8EFF7 0%, #DCE5F0 100%);
  height: 620px;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`
const Pin = styled.button`
  position: absolute;
  left: ${({ $x }) => $x}%; top: ${({ $y }) => $y}%;
  transform: translate(-50%, -100%);
  background: none; border: none; cursor: pointer;
  color: ${({ theme }) => theme.colors.primarySolid};
  svg { filter: drop-shadow(0 4px 8px rgba(42,141,255,0.4)); }
`
const PinTip = styled.div`
  position: absolute; left: 50%; top: -82px; transform: translateX(-50%);
  background: #fff; border-radius: 10px;
  padding: 10px 12px; min-width: 200px;
  box-shadow: 0 8px 20px rgba(15,23,42,0.12);
  font-size: 13px;
  .t { font-weight: 700; color: #0F172A; }
  .r { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; margin-top: 2px; }
  .p { color: ${({ theme }) => theme.colors.primarySolid}; font-weight: 700; margin-top: 4px; }
`

function PinIcon() {
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" fill="currentColor">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 24 16 24s16-13 16-24C32 7.16 24.84 0 16 0Zm0 22a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z" />
    </svg>
  )
}

function applyFilters(items, f) {
  return items.filter(p => {
    if (f.q) {
      const q = f.q.toLowerCase()
      const t = (p.title || '').toLowerCase()
      const a = (p.address || '').toLowerCase()
      if (!t.includes(q) && !a.includes(q)) return false
    }
    if (f.priceMin && (p.price_per_night ?? 0) < Number(f.priceMin)) return false
    if (f.priceMax && (p.price_per_night ?? Infinity) > Number(f.priceMax)) return false
    if (f.type && p.housing_type !== f.type) return false
    if (f.rooms && (p.max_guests ?? 0) < Number(f.rooms)) return false
    if (f.amenities?.length) {
      const amen = p.amenities || []
      if (!f.amenities.every(a => amen.includes(a))) return false
    }
    return true
  })
}

const COMFORTS_SHORT = ['wifi','kitchen','parking','washing_machine']

export default function HomePage() {
  const [items, setItems] = useState([])
  const [view, setView] = useState('list')
  const [showFilter, setShowFilter] = useState(false)
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({ priceMin: '', priceMax: '', type: '', rooms: '', amenities: [] })
  const [applied, setApplied] = useState({ priceMin: '', priceMax: '', type: '', rooms: '', amenities: [] })
  const [hoverId, setHoverId] = useState(null)
  const [err, setErr] = useState('')
  const fav = useFavorites()

  useEffect(() => {
    housingApi.list()
      .then(r => setItems(r.items || []))
      .catch(() => setErr('Не удалось загрузить объекты'))
  }, [])

  const filtered = useMemo(() => applyFilters(items, { q, ...applied }), [items, q, applied])

  function toggleAmenity(a) {
    setFilters(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  function reset() {
    const empty = { priceMin: '', priceMax: '', type: '', rooms: '', amenities: [] }
    setFilters(empty); setApplied(empty)
  }

  return (
    <PageBg>
      <Header />
      <PageInner>
        <SearchBar value={q} onChange={setQ} onFilter={() => setShowFilter(s => !s)} />

        {showFilter && (
          <FilterPanel>
            <FilterHead>
              <h3>Фильтры 🔍</h3>
              <a onClick={reset}>Сбросить</a>
            </FilterHead>

            <FilterCols>
              <FilterBlock>
                <BlockLabel>Цена за ночь: 0 — 10 000 ₽</BlockLabel>
                <PriceRow>
                  <Input placeholder="От 0" value={filters.priceMin} onChange={e => setFilters({ ...filters, priceMin: e.target.value })} />
                  <Input placeholder="До 100000" value={filters.priceMax} onChange={e => setFilters({ ...filters, priceMax: e.target.value })} />
                </PriceRow>
              </FilterBlock>

              <FilterBlock>
                <BlockLabel>Количество комнат</BlockLabel>
                <ChipsRow>
                  <NumChip $on={!filters.rooms} onClick={() => setFilters({ ...filters, rooms: '' })}>Любое</NumChip>
                  {['1','2','3','4+'].map(n => (
                    <NumChip key={n} $on={filters.rooms === n.replace('+','')} onClick={() => setFilters({ ...filters, rooms: n.replace('+','') })}>{n}</NumChip>
                  ))}
                </ChipsRow>
              </FilterBlock>

              <FilterBlock>
                <BlockLabel>Тип жилья</BlockLabel>
                <ChipsRow>
                  <Chip $on={!filters.type} onClick={() => setFilters({ ...filters, type: '' })}>Все</Chip>
                  {HOUSING_TYPES.map(t => (
                    <Chip key={t.value} $on={filters.type === t.value} onClick={() => setFilters({ ...filters, type: t.value })}>{t.label}</Chip>
                  ))}
                  <Chip $on={filters.type === 'studio'} onClick={() => setFilters({ ...filters, type: 'studio' })}>Студия</Chip>
                </ChipsRow>
              </FilterBlock>

              <FilterBlock>
                <BlockLabel>Удобства</BlockLabel>
                <ChipsRow>
                  {COMFORTS_SHORT.map(k => (
                    <Chip key={k} $on={filters.amenities.includes(k)} onClick={() => toggleAmenity(k)}>{mapAmenityLabel(k)}</Chip>
                  ))}
                </ChipsRow>
              </FilterBlock>
            </FilterCols>

            <ApplyRow>
              <ApplyBtn onClick={() => setApplied(filters)}>Применить фильтры</ApplyBtn>
            </ApplyRow>
          </FilterPanel>
        )}

        <TabsRow>
          <GradientTabs>
            <GradientTab $active={view === 'list'} onClick={() => setView('list')}>Список</GradientTab>
            <GradientTab $active={view === 'map'} onClick={() => setView('map')}>Карта</GradientTab>
          </GradientTabs>
        </TabsRow>

        {err && <ErrorText>{err}</ErrorText>}

        {view === 'list' ? (
          <Grid>
            {filtered.map(it => (
              <PropertyCard key={it.id} item={it} variant="tenant" favorited={fav.has(it.id)} onFavorite={fav.toggle} />
            ))}
            {!filtered.length && !err && <div style={{ color: '#6B7280' }}>Ничего не найдено</div>}
          </Grid>
        ) : (
          <MapBox>
            {filtered.slice(0, 8).map((it, i) => (
              <Pin
                key={it.id}
                $x={15 + (i * 13) % 70}
                $y={20 + (i * 17) % 60}
                onMouseEnter={() => setHoverId(it.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                {hoverId === it.id && (
                  <PinTip>
                    <div className="t">{it.title}</div>
                    <div className="r">★ {it.rating_avg?.toFixed?.(1) || '—'}</div>
                    <div className="p">{it.price_per_night?.toLocaleString('ru-RU')} ₽/ноч.</div>
                  </PinTip>
                )}
                <PinIcon />
              </Pin>
            ))}
          </MapBox>
        )}
      </PageInner>
    </PageBg>
  )
}
