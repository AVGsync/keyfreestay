import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AuthShell, AuthCard, AuthLogoRow, AuthTitle } from '../../components/AuthShell'
import Logo from '../../components/Logo'
import PrimaryButton from '../../components/PrimaryButton'
import { Field, Label, Input } from '../../components/UI'

const Rules = styled.ul`
  margin: 6px 0 16px; padding: 0; list-style: none;
  display: grid; gap: 4px;
  li { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; }
  li.ok { color: ${({ theme }) => theme.colors.success}; }
  li::before { content: '○'; margin-right: 6px; }
  li.ok::before { content: '✓'; }
`

export default function PasswordNewPage() {
  const nav = useNavigate()
  const [p, setP] = useState('')
  const [c, setC] = useState('')
  const rules = useMemo(() => ({
    len: p.length >= 8, upper: /[A-ZА-Я]/.test(p), lower: /[a-zа-я]/.test(p), digit: /\d/.test(p)
  }), [p])
  const ok = rules.len && rules.upper && rules.lower && rules.digit && p === c

  return (
    <AuthShell>
      <AuthCard>
        <AuthLogoRow><Logo /></AuthLogoRow>
        <AuthTitle>Установить новый пароль</AuthTitle>
        <form onSubmit={e => { e.preventDefault(); nav('/login') }}>
          <Field>
            <Label>Новый пароль</Label>
            <Input type="password" value={p} onChange={e => setP(e.target.value)} required />
          </Field>
          <Rules>
            <li className={rules.len ? 'ok' : ''}>Минимум 8 символов</li>
            <li className={rules.upper ? 'ok' : ''}>Заглавная буква</li>
            <li className={rules.lower ? 'ok' : ''}>Строчная буква</li>
            <li className={rules.digit ? 'ok' : ''}>Цифры</li>
          </Rules>
          <Field>
            <Label>Подтверждение пароля</Label>
            <Input type="password" value={c} onChange={e => setC(e.target.value)} required />
          </Field>
          <PrimaryButton type="submit" disabled={!ok} style={{ width: '100%' }}>Установить новый пароль</PrimaryButton>
        </form>
      </AuthCard>
    </AuthShell>
  )
}
