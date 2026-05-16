import { Link } from 'react-router-dom'
import { AuthShell, AuthCard, AuthLogoRow, AuthTitle, AuthLead, AuthFooterText } from '../../components/AuthShell'
import Logo from '../../components/Logo'

export default function PasswordResetSentPage() {
  return (
    <AuthShell>
      <AuthCard>
        <AuthLogoRow><Logo /></AuthLogoRow>
        <AuthTitle>Восстановление пароля</AuthTitle>
        <AuthLead>
          Инструкции отправлены на email. Если письмо не пришло — проверьте папку «Спам».
        </AuthLead>
        <AuthFooterText><Link to="/login">← Вернуться ко входу</Link></AuthFooterText>
      </AuthCard>
    </AuthShell>
  )
}
