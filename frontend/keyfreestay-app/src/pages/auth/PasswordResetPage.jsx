import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell, AuthCard, AuthLogoRow, AuthTitle, AuthLead, AuthFooterText } from '../../components/AuthShell'
import Logo from '../../components/Logo'
import PrimaryButton from '../../components/PrimaryButton'
import { Field, Label, Input } from '../../components/UI'

export default function PasswordResetPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  function onSubmit(e) { e.preventDefault(); nav('/password-reset/sent', { replace: true }) }

  return (
    <AuthShell>
      <AuthCard>
        <AuthLogoRow><Logo /></AuthLogoRow>
        <AuthTitle>Восстановление пароля</AuthTitle>
        <AuthLead>Введите ваш email. Мы отправим ссылку для сброса пароля.</AuthLead>
        <form onSubmit={onSubmit}>
          <Field>
            <Label>Электронная почта</Label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@domain.com" />
          </Field>
          <PrimaryButton type="submit" style={{ width: '100%' }}>Отправить инструкции</PrimaryButton>
        </form>
        <AuthFooterText><Link to="/login">← Вернуться ко входу</Link></AuthFooterText>
      </AuthCard>
    </AuthShell>
  )
}
