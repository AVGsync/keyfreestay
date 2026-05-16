import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { AuthShell, AuthCard, AuthLogoRow, AuthTitle, AuthLead, AuthFooterText } from '../../components/AuthShell'
import Logo from '../../components/Logo'
import PrimaryButton from '../../components/PrimaryButton'
import { Field, Label, Input, ErrorText } from '../../components/UI'

const Row = styled.div`
  display: flex; justify-content: flex-end; margin-top: -8px; margin-bottom: 14px;
  a { color: ${({ theme }) => theme.colors.primarySolid}; font-size: 13px; font-weight: 500; }
  a:hover { text-decoration: underline; }
`

export default function LoginPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await login({ email, password })
      const to = loc.state?.from?.pathname || '/'
      nav(to, { replace: true })
    } catch (e) {
      setErr(e.status === 401 ? 'Неверный email или пароль' : 'Ошибка входа. Попробуйте позже.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <AuthCard>
        <AuthLogoRow><Logo /></AuthLogoRow>
        <AuthTitle>Вход в систему</AuthTitle>
        <AuthLead>Введите ваши учётные данные для доступа к платформе</AuthLead>
        <form onSubmit={onSubmit}>
          <Field>
            <Label>Электронная почта</Label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@domain.com" />
          </Field>
          <Field>
            <Label>Пароль</Label>
            <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Введите пароль" />
          </Field>
          <Row><Link to="/password-reset">Забыли пароль?</Link></Row>
          {err && <ErrorText style={{ marginBottom: 12 }}>{err}</ErrorText>}
          <PrimaryButton type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Входим…' : 'Войти'}
          </PrimaryButton>
        </form>
        <AuthFooterText>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></AuthFooterText>
      </AuthCard>
    </AuthShell>
  )
}
