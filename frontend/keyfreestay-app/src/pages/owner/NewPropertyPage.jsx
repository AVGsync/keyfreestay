import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { housingApi } from '../../api/client'
import PrimaryButton from '../../components/PrimaryButton'
import { PageBg, PageInner, Card, BackLink, Field, Label, Input, Textarea, ErrorText } from '../../components/UI'
import { HOUSING_TYPES, COMFORTS, SMART, mapAmenityLabel, CANCELLATION_POLICIES, formatPrice, fixUrl } from '../../utils/format'

const Progress = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  margin: 24px 0 16px;
  > div { height: 6px; border-radius: 999px; background: #E2E8F0; }
  > div.on { background: ${({ theme }) => theme.gradients.brand}; }
`
const Footer = styled.div`
  display: flex; justify-content: space-between; gap: 12px;
  padding: 18px 0;
  @media (max-width: 540px) { flex-direction: column; }
`
const Ghost = styled.button`
  background: #F1F5F9; border: none; border-radius: 16px;
  padding: 14px 24px; cursor: pointer;
  font-weight: 600; font-size: 15px; color: #0F172A;
`
const TypeGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`
const TypeCard = styled.button`
  border: 2px solid ${({ $on }) => $on ? '#16A34A' : 'transparent'};
  background: ${({ $on }) => $on ? 'linear-gradient(135deg, #ECFDF5, #DBEAFE)' : '#F8FAFC'};
  border-radius: 12px;
  padding: 22px 16px;
  font-family: inherit; cursor: pointer;
  text-align: center;
  font-size: 14px; font-weight: 600;
  color: ${({ $on }) => $on ? '#0F172A' : '#0F172A'};
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
const Drop = styled.label`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 1.5px dashed #CBD5E1;
  border-radius: 12px; cursor: pointer;
  padding: 32px; min-height: 160px;
  color: #6B7280;
  &:hover { border-color: #2A8DFF; color: #2A8DFF; }
`
const Thumbs = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px;
  .th { width: 64px; height: 64px; border-radius: 10px; overflow: hidden; background: #E2E8F0; position: relative;
    img { width: 100%; height: 100%; object-fit: cover; }
    button { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; font-size: 10px; line-height: 1; }
  }
`
const ModalBg = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.4);
  display: grid; place-items: center; z-index: 50; padding: 20px;
`
const Modal = styled(Card)`
  max-width: 460px; width: 100%;
  h3 { font-size: 16px; font-weight: 800; margin-bottom: 12px; display: flex; justify-content: space-between; }
  p { color: #4A5565; font-size: 14px; margin-bottom: 16px; }
  .actions { display: flex; gap: 8px; }
`

const STEPS = ['Основная информация','Параметры и удобства','Фотографии','Цены и условия']

export default function NewPropertyPage() {
  const { id } = useParams()
  const isEdit = !!id
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [housingId, setHousingId] = useState(id || null)
  const [item, setItem] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)

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
    cancellation_policy: 'flexible'
  })

  useEffect(() => {
    if (!isEdit) return
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
        cancellation_policy: h.cancellation_policy || 'flexible'
      })
    }).catch(() => setErr('Объект не найден'))
  }, [id, isEdit])

  function randomCoords() {
    const lat = 55.55 + Math.random() * 0.4
    const lng = 37.40 + Math.random() * 0.45
    return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
  }

  function buildPatch(extra = {}) {
    const p = { housing_type: data.housing_type, amenities: data.amenities }
    if (data.title?.trim()) p.title = data.title.trim()
    if (data.address?.trim()) p.address = data.address.trim()
    if (data.description?.trim()) p.description = data.description.trim()
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
    return { ...p, ...extra }
  }

  function validatePublish() {
    const miss = []
    if (!data.title?.trim()) miss.push('название')
    if (!data.address?.trim()) miss.push('адрес')
    if (!(Number(data.price_per_night) > 0)) miss.push('цену за ночь')
    if (!(Number(data.max_guests) > 0)) miss.push('максимум гостей')
    return miss
  }

  function explain(e) {
    const msg = String(e?.message || '')
    if (/price_per_night/.test(msg)) return 'Цена за ночь должна быть больше 0'
    if (/published_required_fields/.test(msg)) return 'Для публикации нужны: название, адрес, координаты, цена за ночь, максимум гостей'
    return 'Не удалось сохранить'
  }

  function toggleA(a) {
    setData(d => ({ ...d, amenities: d.amenities.includes(a) ? d.amenities.filter(x => x !== a) : [...d.amenities, a] }))
  }

  async function ensureCreated() {
    if (housingId) return housingId
    const res = await housingApi.create({
      housing_type: data.housing_type,
      title: data.title || undefined,
      address: data.address || undefined,
      description: data.description || undefined
    })
    setHousingId(res.id)
    return res.id
  }

  async function saveDraft(close = false) {
    setBusy(true); setErr('')
    try {
      const hid = await ensureCreated()
      await housingApi.update(hid, buildPatch({ status: 'draft' }))
      if (close) nav('/owner')
    } catch (e) { setErr(explain(e)) }
    finally { setBusy(false) }
  }

  async function publish() {
    setErr('')
    const miss = validatePublish()
    if (miss.length) { setErr('Для публикации заполните: ' + miss.join(', ')); return }
    setBusy(true)
    try {
      const hid = await ensureCreated()
      await housingApi.update(hid, buildPatch({ status: 'published' }))
      nav('/owner')
    } catch (e) { setErr(explain(e)) }
    finally { setBusy(false) }
  }

  async function uploadFiles(fl) {
    const files = Array.from(fl || [])
    if (!files.length) return
    setBusy(true); setErr('')
    try {
      const id = await ensureCreated()
      await housingApi.uploadImages(id, files)
      const fresh = await housingApi.get(id)
      setItem(fresh)
    } catch (e) { setErr('Не удалось загрузить фото') } finally { setBusy(false) }
  }

  async function removeImg(key) {
    if (!housingId) return
    setBusy(true)
    try {
      await housingApi.removeImage(housingId, key)
      const fresh = await housingApi.get(housingId)
      setItem(fresh)
    } catch {} finally { setBusy(false) }
  }

  const goBack = () => { if (step === 0) setConfirmExit(true); else setStep(s => s - 1) }

  return (
    <PageBg>
      <Header title={`Мои объекты / ${isEdit ? 'Редактировать объект' : 'Добавить объект'}`} />
      <PageInner>
        <BackLink onClick={goBack}>← Вернуться назад</BackLink>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>{STEPS[step]}</h3>

            {step === 0 && (
              <>
                <Field>
                  <Label>Тип объекта</Label>
                  <TypeGrid>
                    {HOUSING_TYPES.map(t => (
                      <TypeCard key={t.value} type="button" $on={data.housing_type === t.value}
                        onClick={() => setData({ ...data, housing_type: t.value })}>
                        <span className="em">{t.icon}</span>{t.label}
                      </TypeCard>
                    ))}
                  </TypeGrid>
                </Field>
                <Field>
                  <Label>Адрес</Label>
                  <Input value={data.address} onChange={e => setData({ ...data, address: e.target.value })} placeholder="Улица, дом, город" />
                </Field>
                <Field>
                  <Label>Название объявления</Label>
                  <Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder="Современная квартира в центре" />
                </Field>
                <Field>
                  <Label>Описание</Label>
                  <Textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Расскажите о вашем объекте..." rows={5} />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field>
                  <Label>Максимальное количество гостей</Label>
                  <Input type="number" min={1} max={50} value={data.max_guests} onChange={e => setData({ ...data, max_guests: e.target.value })} placeholder="4" />
                </Field>
                <Field>
                  <Label>Удобства</Label>
                  <ChipsRow>
                    {COMFORTS.map(k => (
                      <Chip key={k} type="button" $on={data.amenities.includes(k)} onClick={() => toggleA(k)}>{mapAmenityLabel(k)}</Chip>
                    ))}
                  </ChipsRow>
                </Field>
                <Field>
                  <Label>Умный дом</Label>
                  <ChipsRow>
                    {SMART.map(k => (
                      <Chip key={k} type="button" $on={data.amenities.includes(k)} onClick={() => toggleA(k)}>{mapAmenityLabel(k)}</Chip>
                    ))}
                  </ChipsRow>
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field>
                  <Drop>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
                    <div style={{ marginTop: 8, fontWeight: 600, color: '#0F172A' }}>Загрузите фотографии вашего объекта</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: '#6B7280' }}>PNG, JPG до 10 МБ</div>
                    <input type="file" hidden multiple accept="image/jpeg,image/png,image/webp" onChange={e => uploadFiles(e.target.files)} />
                  </Drop>
                  <small style={{ display: 'block', color: '#6B7280', fontSize: 12, marginTop: 8, textAlign: 'center' }}>Добавьте минимум 5 фотографий для лучшего результата</small>
                </Field>
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
              </>
            )}

            {step === 3 && (
              <>
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
              </>
            )}
          </Card>

          <Progress>
            {STEPS.map((_, i) => <div key={i} className={i <= step ? 'on' : ''} />)}
          </Progress>

          {err && <ErrorText style={{ marginBottom: 10 }}>{err}</ErrorText>}

          <Footer>
            <Ghost onClick={() => saveDraft(false)} disabled={busy}>Сохранить черновик</Ghost>
            {step < 3 ? (
              <PrimaryButton onClick={() => setStep(s => s + 1)} disabled={busy}>Далее</PrimaryButton>
            ) : (
              <PrimaryButton onClick={publish} disabled={busy}>{busy ? 'Публикуем…' : 'Опубликовать'}</PrimaryButton>
            )}
          </Footer>
        </div>
      </PageInner>

      {confirmExit && (
        <ModalBg onClick={() => setConfirmExit(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <h3>Сохранить черновик? <button onClick={() => setConfirmExit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94A3B8' }}>×</button></h3>
            <p>Хотите сохранить введённые данные как черновик перед выходом?</p>
            <div className="actions">
              <Ghost onClick={() => nav('/owner')}>Не сохранять</Ghost>
              <PrimaryButton onClick={() => saveDraft(true)}>Сохранить</PrimaryButton>
            </div>
          </Modal>
        </ModalBg>
      )}
    </PageBg>
  )
}
