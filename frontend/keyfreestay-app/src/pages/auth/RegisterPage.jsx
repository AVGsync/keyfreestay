import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { AuthShell, AuthCard, AuthLogoRow, AuthTitle, AuthLead, AuthFooterText } from '../../components/AuthShell'
import Logo from '../../components/Logo'
import PrimaryButton from '../../components/PrimaryButton'
import { Field, Label, Input, ErrorText, GradientTabs, GradientTab } from '../../components/UI'

const Rules = styled.ul`
  margin: 6px 0 16px; padding: 0; list-style: none;
  display: grid; gap: 4px;
  li { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; }
  li.ok { color: ${({ theme }) => theme.colors.success}; }
  li::before { content: '○'; margin-right: 6px; }
  li.ok::before { content: '✓'; }
`

export default function RegisterPage() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [role, setRole] = useState('tenant')
  const [full_name, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const rules = useMemo(() => ({
    len: password.length >= 8,
    upper: /[A-ZА-Я]/.test(password),
    lower: /[a-zа-я]/.test(password),
    digit: /\d/.test(password)
  }), [password])

  const allOk = rules.len && rules.upper && rules.lower && rules.digit && password === confirm && full_name.trim().length >= 3 && /@/.test(email)

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    if (!allOk) { setErr('Проверьте корректность данных'); return }
    setBusy(true)
    try {
      await register({ full_name, email, password, role })
      nav('/passport', { replace: true })
    } catch (e) {
      setErr('Не удалось создать аккаунт. Возможно, email уже занят.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <AuthCard>
        <AuthLogoRow><Logo /></AuthLogoRow>
        <AuthTitle>Регистрация</AuthTitle>
        <AuthLead>Создайте учётную запись для доступа к платформе</AuthLead>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <GradientTabs>
            <GradientTab type="button" $active={role === 'tenant'} onClick={() => setRole('tenant')}>Арендатор</GradientTab>
            <GradientTab type="button" $active={role === 'owner'} onClick={() => setRole('owner')}>Арендодатель</GradientTab>
          </GradientTabs>
        </div>

        <form onSubmit={onSubmit}>
          <Field>
            <Label>Полное имя</Label>
            <Input value={full_name} onChange={e => setFullName(e.target.value)} placeholder="Иван Иванов" required minLength={3} />
          </Field>
          <Field>
            <Label>Электронная почта</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@domain.com" required />
          </Field>
          <Field>
            <Label>Пароль</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Введите пароль" required />
          </Field>
          <Rules>
            <li className={rules.len ? 'ok' : ''}>Минимум 8 символов</li>
            <li className={rules.upper ? 'ok' : ''}>Заглавная буква</li>
            <li className={rules.lower ? 'ok' : ''}>Строчная буква</li>
            <li className={rules.digit ? 'ok' : ''}>Цифры</li>
          </Rules>
          <Field>
            <Label>Подтверждение пароля</Label>
            <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Повторите пароль" required />
          </Field>
          {err && <ErrorText style={{ marginBottom: 12 }}>{err}</ErrorText>}
          <PrimaryButton type="submit" disabled={busy || !allOk} style={{ width: '100%' }}>
            {busy ? 'Создаём…' : 'Зарегистрироваться'}
          </PrimaryButton>
        </form>
        <AuthFooterText>Уже есть аккаунт? <Link to="/login">Войти</Link></AuthFooterText>
      </AuthCard>
    </AuthShell>
  )
}
