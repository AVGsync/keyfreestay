import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import PrimaryButton from '../../components/PrimaryButton'
import { PageBg, PageInner, Card, BackLink, Field, Label, Input, ErrorText, Hint } from '../../components/UI'

const PhotoCard = styled(Card)`
  margin-bottom: 16px;
  h3 { font-size: 16px; font-weight: 800; margin-bottom: 14px; }
  .row { display: grid; grid-template-columns: 96px 1fr; gap: 16px; }
  .av { width: 96px; height: 96px; border-radius: 50%;
    background: ${({ theme }) => theme.gradients.brand};
    color: #fff; display: inline-flex; align-items: center; justify-content: center;
    font-size: 38px; font-weight: 800;
  }
  .drop { border: 1.5px dashed #CBD5E1; border-radius: 12px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #6B7280; cursor: pointer; min-height: 96px;
  }
`

export default function ProfileEditPage() {
  const nav = useNavigate()
  const { user, updateMe } = useAuth()
  const [full_name, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [dob, setDob] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const initial = (user?.full_name || user?.email || 'И').charAt(0).toUpperCase()

  async function save(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const patch = {}
      if (full_name && full_name !== user.full_name) patch.full_name = full_name
      if (phone && phone !== user.phone) patch.phone = phone
      await updateMe(patch)
      nav(-1)
    } catch {
      setErr('Не удалось сохранить изменения')
    } finally { setBusy(false) }
  }

  return (
    <PageBg>
      <Header title="Личный кабинет / Редактировать профиль" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <form onSubmit={save} style={{ maxWidth: 720, margin: '0 auto' }}>
          <PhotoCard>
            <h3>Фото профиля</h3>
            <div className="row">
              <div className="av">{initial}</div>
              <label className="drop">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
                <div style={{ marginTop: 6, fontSize: 13 }}>Изменить фото</div>
                <input type="file" accept="image/*" hidden />
              </label>
            </div>
          </PhotoCard>

          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Персональные данные</h3>
            <Field>
              <Label>ФИО</Label>
              <Input value={full_name} onChange={e => setFullName(e.target.value)} placeholder="Иван Иванов" />
            </Field>
            <Field>
              <Label>Электронная почта</Label>
              <Input value={user?.email || ''} disabled />
              <Hint>Email нельзя изменить</Hint>
            </Field>
            <Field>
              <Label>Номер телефона</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+71234567890" />
            </Field>
            <Field>
              <Label>Дата рождения</Label>
              <Input type="text" value={dob} onChange={e => setDob(e.target.value)} placeholder="00.00.0000" />
            </Field>
          </Card>

          {err && <ErrorText style={{ marginBottom: 12 }}>{err}</ErrorText>}

          <PrimaryButton type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Сохраняем…' : 'Сохранить изменения'}
          </PrimaryButton>
        </form>
      </PageInner>
    </PageBg>
  )
}
