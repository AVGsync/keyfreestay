import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AuthShell, AuthCard, AuthLogoRow, AuthTitle, AuthLead, AuthFooterText, InlineLink } from '../../components/AuthShell'
import Logo from '../../components/Logo'
import PrimaryButton from '../../components/PrimaryButton'
import { Field, Label, Input } from '../../components/UI'

const Drop = styled.label`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100px;
  border: 1.5px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px; text-align: center;
  &:hover { border-color: ${({ theme }) => theme.colors.primarySolid}; color: ${({ theme }) => theme.colors.primarySolid}; }
  span.f { font-size: 11px; margin-top: 4px; color: ${({ theme }) => theme.colors.success}; }
`
const UpIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
  </svg>
)

export default function PassportUploadPage() {
  const nav = useNavigate()
  const [docType, setDocType] = useState('passport')
  const [doc, setDoc] = useState(null)
  const [selfie, setSelfie] = useState(null)

  function submit(e) {
    e.preventDefault()
    nav('/', { replace: true })
  }

  return (
    <AuthShell>
      <AuthCard>
        <AuthLogoRow><Logo /></AuthLogoRow>
        <AuthTitle>Подтверждение личности</AuthTitle>
        <AuthLead>
          Загрузите фото документа и селфи. Это требуется для повышения безопасности.
        </AuthLead>
        <form onSubmit={submit}>
          <Field>
            <Label>Тип документа</Label>
            <select
              value={docType} onChange={e => setDocType(e.target.value)}
              style={{ width: '100%', height: 44, padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: 12, fontFamily: 'inherit', fontSize: 14, background: '#fff' }}>
              <option value="passport">Паспорт</option>
              <option value="id_card">ID-карта</option>
              <option value="driver_license">Водительское</option>
            </select>
          </Field>
          <Field>
            <Label>Скан / фото документа</Label>
            <Drop>
              <UpIcon />
              <div style={{ marginTop: 6 }}>Загрузите фото первой страницы</div>
              {doc && <span className="f">{doc.name}</span>}
              <Input type="file" accept="image/*" hidden style={{ display: 'none' }} onChange={e => setDoc(e.target.files?.[0] || null)} />
            </Drop>
          </Field>
          <Field>
            <Label>Селфи с документом</Label>
            <Drop>
              <UpIcon />
              <div style={{ marginTop: 6 }}>Сделайте селфи с документом в руках</div>
              {selfie && <span className="f">{selfie.name}</span>}
              <Input type="file" accept="image/*" hidden style={{ display: 'none' }} onChange={e => setSelfie(e.target.files?.[0] || null)} />
            </Drop>
          </Field>
          <PrimaryButton type="submit" style={{ width: '100%' }}>Отправить на проверку</PrimaryButton>
        </form>
        <AuthFooterText><InlineLink onClick={() => nav('/', { replace: true })}>Пропустить и войти в приложение</InlineLink></AuthFooterText>
      </AuthCard>
    </AuthShell>
  )
}
