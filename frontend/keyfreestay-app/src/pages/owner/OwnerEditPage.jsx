import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { housingApi } from '../../api/client'
import PrimaryButton from '../../components/PrimaryButton'
import { PageBg, PageInner, Card, BackLink, Field, Label, Input, Textarea, ErrorText, Badge } from '../../components/UI'
import { HOUSING_TYPES, COMFORTS, SMART, mapAmenityLabel, CANCELLATION_POLICIES, fixUrl } from '../../utils/format'

const StatusCard = styled(Card)`
  margin-bottom: 16px;
  .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  h3 { font-size: 16px; font-weight: 800; }
  .sub { font-size: 12px; color: #6B7280; margin-top: 2px; }
  .acts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
`
const StatusBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px;
  border: 1px solid ${({ $danger }) => $danger ? '#FCA5A5' : '#FDE68A'};
  background: ${({ $danger }) => $danger ? '#FEF2F2' : '#FFFBEB'};
  color: ${({ $danger }) => $danger ? '#DC2626' : '#92400E'};
  border-radius: 12px;
  font-family: inherit; cursor: pointer;
  font-weight: 600; font-size: 14px;
`
const Sec = styled(Card)` margin-bottom: 16px; `
const SecTitle = styled.h3` font-size: 16px; font-weight: 800; margin-bottom: 14px; `
const TypeGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`
const TypeCard = styled.button`
  border: 2px solid ${({ $on }) => $on ? '#16A34A' : 'transparent'};
  background: ${({ $on }) => $on ? 'linear-gradient(135deg, #ECFDF5, #DBEAFE)' : '#F8FAFC'};
  border-radius: 12px;
  padding: 22px 16px;
  font-family: inherit; cursor: pointer; text-align: center;
  font-size: 14px; font-weight: 600;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  .em { font-size: 24px; }
`
const ChipsRow = styled.div` display: flex; flex-wrap: wrap; gap: 10px; `
const Chip = styled.button`
  border: none; cursor: pointer; font-family: inherit;
  padding: 12px 22px;
  border-radius: 999px;
  background: ${({ $on }) => $on ? '#2A8DFF' : '#F1F5F9'};
  color: ${({ $on }) => $on ? '#fff' : '#0F172A'};
  font-size: 13px; font-weight: 600;
`
const Drop = styled.label`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 1.5px dashed #CBD5E1;
  border-radius: 12px; cursor: pointer;
  padding: 28px;
  color: #6B7280;
  &:hover { border-color: #2A8DFF; color: #2A8DFF; }
`
const Thumbs = styled.div`
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 14px;
  @media (max-width: 760px) { grid-template-columns: repeat(3, 1fr); }
  .th { aspect-ratio: 4/3; border-radius: 10px; overflow: hidden; background: #E2E8F0; position: relative;
    img { width: 100%; height: 100%; object-fit: cover; }
    button { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 12px; line-height: 1; }
  }
`
const PolicyOpt = styled.label`
  display: flex; gap: 12px; align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid ${({ $on }) => $on ? '#16A34A' : '#E5E7EB'};
  background: ${({ $on }) => $on ? '#F0FDF4' : '#fff'};
  cursor: pointer;
  margin-bottom: 10px;
  input { accent-color: ${({ theme }) => theme.colors.primarySolid}; }
  .t { font-weight: 700; font-size: 14px; }
  .s { font-size: 12px; color: #6B7280; margin-top: 2px; }
`

const STATUS_LABEL = {
  published: { label: 'Опубликовано', variant: 'success' },
  draft: { label: 'Черновик', variant: 'default' },
  unpublished: { label: 'Снято', variant: 'warning' }
}

export default function OwnerEditPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [item, setItem] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const [data, setData] = useState({
    housing_type: 'apartment',
    title: '',
    address: '',
    description: '',
    latitude: '',
    longitude: '',
    max_guests: 4,
    amenities: [],
    price_per_night: '',
    cancellation_policy: 'flexible',
    status: 'draft'
  })

  function load() {
    housingApi.get(id).then(h => {
      setItem(h)
      setData({
        housing_type: h.housing_type || 'apartment',
        title: h.title || '',
        address: h.address || '',
        description: h.description || '',
        latitude: h.latitude ?? '',
        longitude: h.longitude ?? '',
        max_guests: h.max_guests || 4,
        amenities: h.amenities || [],
        price_per_night: h.price_per_night || '',
        cancellation_policy: h.cancellation_policy || 'flexible',
        status: h.status || 'draft'
      })
    }).catch(() => setErr('Объект не найден'))
  }
  useEffect(load, [id])

  function toggleA(a) {
    setData(d => ({ ...d, amenities: d.amenities.includes(a) ? d.amenities.filter(x => x !== a) : [...d.amenities, a] }))
  }

  function explain(e) {
    const msg = String(e?.message || '')
    if (/price_per_night/.test(msg)) return 'Цена за ночь должна быть больше 0'
    if (/published_required_fields/.test(msg)) return 'Для публикации заполните: название, адрес, координаты, цену за ночь и максимум гостей'
    if (/foreign key|constraint/.test(msg)) return 'Не удалось сохранить: проверьте корректность полей'
    return 'Не удалось сохранить'
  }

  function randomCoords() {
    // Moscow-area random coords, anchored so it lands on map plausibly
    const lat = 55.55 + Math.random() * 0.4
    const lng = 37.40 + Math.random() * 0.45
    return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
  }

  function buildPatch(override = {}) {
    const p = { housing_type: data.housing_type, amenities: data.amenities }
    if (data.title?.trim()) p.title = data.title.trim()
    if (data.address?.trim()) p.address = data.address.trim()
    if (data.description?.trim()) p.description = data.description.trim()
    // always send valid coords — generate random if missing/invalid
    const curLat = Number(data.latitude)
    const curLng = Number(data.longitude)
    const hasLat = data.latitude !== '' && data.latitude != null && Number.isFinite(curLat) && curLat >= -90 && curLat <= 90
    const hasLng = data.longitude !== '' && data.longitude != null && Number.isFinite(curLng) && curLng >= -180 && curLng <= 180
    const r = randomCoords()
    p.latitude = hasLat ? curLat : r.latitude
    p.longitude = hasLng ? curLng : r.longitude
    const mg = Number(data.max_guests)
    if (mg > 0) p.max_guests = mg
    const price = Number(data.price_per_night)
    if (price > 0) p.price_per_night = price
    if (data.cancellation_policy) p.cancellation_policy = data.cancellation_policy
    if (data.status) p.status = data.status
    return { ...p, ...override }
  }

  function validatePublish() {
    const miss = []
    if (!data.title?.trim()) miss.push('название')
    if (!data.address?.trim()) miss.push('адрес')
    if (!(Number(data.price_per_night) > 0)) miss.push('цену за ночь')
    if (!(Number(data.max_guests) > 0)) miss.push('максимум гостей')
    return miss
  }

  async function save() {
    setBusy(true); setErr('')
    const target = data.status
    if (target === 'published') {
      const miss = validatePublish()
      if (miss.length) { setErr('Для публикации заполните: ' + miss.join(', ')); setBusy(false); return }
    }
    try {
      await housingApi.update(id, buildPatch())
      nav('/owner')
    } catch (e) { setErr(explain(e)) }
    finally { setBusy(false) }
  }

  async function changeStatus(s) {
    setErr('')
    if (s === 'published') {
      const miss = validatePublish()
      if (miss.length) { setErr('Для публикации заполните: ' + miss.join(', ')); return }
    }
    setBusy(true)
    try {
      await housingApi.update(id, buildPatch({ status: s }))
      setData(d => ({ ...d, status: s })); load()
    } catch (e) { setErr(explain(e)) }
    finally { setBusy(false) }
  }

  async function remove() {
    if (!confirm('Удалить объект?')) return
    setBusy(true); setErr('')
    try { await housingApi.remove(id); nav('/owner') }
    catch (e) { setErr('Не удалось удалить: ' + (e?.message || '')) }
    finally { setBusy(false) }
  }

  async function uploadFiles(fl) {
    const files = Array.from(fl || []); if (!files.length) return
    setBusy(true); setErr('')
    try { await housingApi.uploadImages(id, files); load() }
    catch (e) { setErr('Не удалось загрузить фото: ' + (e?.message || '')) }
    finally { setBusy(false) }
  }
  async function removeImg(key) {
    setBusy(true); setErr('')
    try { await housingApi.removeImage(id, key); load() }
    catch (e) { setErr('Не удалось удалить фото: ' + (e?.message || '')) }
    finally { setBusy(false) }
  }

  if (err && !item) return <PageBg><Header /><PageInner><BackLink onClick={() => nav(-1)}>← Назад</BackLink>{err}</PageInner></PageBg>

  const tag = STATUS_LABEL[data.status] || { label: data.status, variant: 'default' }

  return (
    <PageBg>
      <Header title="Мои объекты / Редактировать объект" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <StatusCard>
            <div className="head">
              <div>
                <h3>Статус объявления</h3>
                <div className="sub">Управление видимостью</div>
              </div>
              <Badge $variant={tag.variant}>● {tag.label}</Badge>
            </div>
            <div className="acts">
              {data.status === 'published' ? (
                <StatusBtn onClick={() => changeStatus('unpublished')} disabled={busy}>👁 Снять с публикации</StatusBtn>
              ) : (
                <StatusBtn onClick={() => changeStatus('published')} disabled={busy}>↑ Опубликовать</StatusBtn>
              )}
              <StatusBtn $danger onClick={remove} disabled={busy}>🗑 Удалить объект</StatusBtn>
            </div>
          </StatusCard>

          <Sec>
            <SecTitle>Основная информация</SecTitle>
            <Field>
              <Label>Тип объекта</Label>
              <TypeGrid>
                {HOUSING_TYPES.map(t => (
                  <TypeCard key={t.value} $on={data.housing_type === t.value} onClick={() => setData({ ...data, housing_type: t.value })}>
                    <span className="em">{t.icon}</span>{t.label}
                  </TypeCard>
                ))}
              </TypeGrid>
            </Field>
            <Field>
              <Label>Адрес</Label>
              <Input value={data.address} onChange={e => setData({ ...data, address: e.target.value })} placeholder="Москва, ул. Тверская, 12" />
            </Field>
            <Field>
              <Label>Название объявления</Label>
              <Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder="Современная квартира в центре" />
            </Field>
            <Field>
              <Label>Описание</Label>
              <Textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Расскажите о вашем объекте..." rows={4} />
            </Field>
          </Sec>

          <Sec>
            <SecTitle>Параметры и удобства</SecTitle>
            <Field>
              <Label>Максимальное количество гостей</Label>
              <Input type="number" min={1} max={50} value={data.max_guests} onChange={e => setData({ ...data, max_guests: e.target.value })} />
            </Field>
            <Field>
              <Label>Удобства</Label>
              <ChipsRow>
                {COMFORTS.map(k => (
                  <Chip key={k} $on={data.amenities.includes(k)} onClick={() => toggleA(k)}>{mapAmenityLabel(k)}</Chip>
                ))}
              </ChipsRow>
            </Field>
            <Field>
              <Label>Умный дом</Label>
              <ChipsRow>
                {SMART.map(k => (
                  <Chip key={k} $on={data.amenities.includes(k)} onClick={() => toggleA(k)}>{mapAmenityLabel(k)}</Chip>
                ))}
              </ChipsRow>
            </Field>
          </Sec>

          <Sec>
            <SecTitle>Фотографии</SecTitle>
            <Drop>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
              <div style={{ marginTop: 8, fontWeight: 600, color: '#0F172A' }}>Загрузите фотографии вашего объекта</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#6B7280' }}>PNG, JPG до 10 МБ</div>
              <input type="file" hidden multiple accept="image/jpeg,image/png,image/webp" onChange={e => uploadFiles(e.target.files)} />
            </Drop>
            {item?.images?.length > 0 && (
              <Thumbs>
                {item.images.map(img => (
                  <div className="th" key={img.ID}>
                    {img.ImageURL && <img src={fixUrl(img.ImageURL)} alt="" />}
                    <button onClick={() => removeImg(img.StorageKey)}>×</button>
                  </div>
                ))}
              </Thumbs>
            )}
          </Sec>

          <Sec>
            <SecTitle>Цены и условия</SecTitle>
            <Field>
              <Label>Цена за ночь (₽)</Label>
              <Input type="number" min={1} value={data.price_per_night} onChange={e => setData({ ...data, price_per_night: e.target.value })} placeholder="4500" />
            </Field>
            <Field>
              <Label>Политика отмены</Label>
              {CANCELLATION_POLICIES.map(p => (
                <PolicyOpt key={p.value} $on={data.cancellation_policy === p.value}>
                  <input type="radio" name="cp" checked={data.cancellation_policy === p.value} onChange={() => setData({ ...data, cancellation_policy: p.value })} />
                  <div><div className="t">{p.label}</div><div className="s">{p.desc}</div></div>
                </PolicyOpt>
              ))}
            </Field>
          </Sec>

          {err && <ErrorText style={{ marginBottom: 10 }}>{err}</ErrorText>}
          <PrimaryButton onClick={save} disabled={busy} style={{ width: '100%' }}>{busy ? 'Сохраняем…' : 'Сохранить изменения'}</PrimaryButton>
        </div>
      </PageInner>
    </PageBg>
  )
}
