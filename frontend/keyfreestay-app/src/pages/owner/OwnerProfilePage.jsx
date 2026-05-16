import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { bookingApi, housingApi } from '../../api/client'
import { PageBg, PageInner, Card, BackLink, Stat, Toggle, Badge } from '../../components/UI'

const Top = styled.div`
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px;
  margin-bottom: 16px;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`
const UserCard = styled(Card)`
  display: flex; gap: 16px; align-items: center;
  .av { width: 56px; height: 56px; border-radius: 50%;
    background: ${({ theme }) => theme.gradients.brand};
    color: #fff; display: inline-flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 800;
  }
  h3 { font-size: 18px; font-weight: 800; display: inline-flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .e { font-size: 13px; color: #6B7280; margin-top: 4px; }
`
const SwitchCard = styled(Card)`
  display: flex; align-items: center; gap: 14px;
  .ic { width: 40px; height: 40px; border-radius: 12px; background: #F1F5F9; display: inline-flex; align-items: center; justify-content: center; color: #6B7280; }
  .t { font-weight: 700; font-size: 14px; }
  .s { font-size: 12px; color: #6B7280; margin-top: 2px; }
`
const Stats = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  margin-bottom: 16px;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`
const MenuGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  margin-bottom: 32px;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`
const MenuItem = styled(Link)`
  display: flex; gap: 14px; align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  &::after { content: '›'; margin-left: auto; color: #94A3B8; font-size: 22px; }
  .ic { width: 36px; height: 36px; border-radius: 50%; background: #F1F5F9; display: inline-flex; align-items: center; justify-content: center; color: #6B7280; }
  .t { font-weight: 700; font-size: 14px; }
  .s { font-size: 12px; color: #6B7280; margin-top: 2px; }
`
const Logout = styled.button`
  display: inline-flex; gap: 8px; align-items: center;
  background: #FEE2E2; color: #DC2626;
  border: none; border-radius: 12px;
  padding: 16px 32px; cursor: pointer;
  font-weight: 700; font-size: 14px;
`

export default function OwnerProfilePage() {
  const nav = useNavigate()
  const { user, logout, switchRole, viewRole } = useAuth()
  const [objects, setObjects] = useState(0)
  const [bks, setBks] = useState(0)

  useEffect(() => {
    housingApi.list().then(r => setObjects((r.items || []).length)).catch(() => {})
    bookingApi.list().then(r => setBks((r.items || []).length)).catch(() => {})
  }, [])

  if (!user) return null
  const initial = (user.full_name || user.email || 'И').charAt(0).toUpperCase()

  return (
    <PageBg>
      <Header title="Личный кабинет" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>

        <Top>
          <UserCard>
            <div className="av">{initial}</div>
            <div style={{ flex: 1 }}>
              <h3>{user.full_name || 'Пользователь'} <Badge $variant="success">✓ Верифицирован</Badge> <Badge $variant="info">Арендодатель</Badge></h3>
              <div className="e">{user.email}</div>
            </div>
          </UserCard>

          <SwitchCard>
            <div className="ic">⚙</div>
            <div style={{ flex: 1 }}>
              <div className="t">Вернуться на профиль арендатора</div>
              <div className="s">Найти и забронировать жильё</div>
            </div>
            <Toggle $on={viewRole === 'owner'} onClick={switchRole} />
          </SwitchCard>
        </Top>

        <Stats>
          <Stat><div className="v">{objects}</div><div className="l">Объектов</div></Stat>
          <Stat><div className="v">{bks}</div><div className="l">Бронирований</div></Stat>
          <Stat><div className="v">4.9</div><div className="l">Рейтинг</div></Stat>
        </Stats>

        <MenuGrid>
          <MenuItem to="/app/profile/edit">
            <div className="ic">👤</div>
            <div><div className="t">Редактировать профиль</div><div className="s">Изменить персональные данные</div></div>
          </MenuItem>
          <MenuItem to="/app/profile/payments">
            <div className="ic">💳</div>
            <div><div className="t">Способы вывода</div><div className="s">Управление сохранёнными картами</div></div>
          </MenuItem>
          <MenuItem to="/app/profile/notifications">
            <div className="ic">🔔</div>
            <div><div className="t">Настройки</div><div className="s">Общие настройки и уведомления</div></div>
          </MenuItem>
          <MenuItem to="/app/profile/support">
            <div className="ic">❓</div>
            <div><div className="t">Справка и поддержка</div><div className="s">Помощь и часто задаваемые вопросы</div></div>
          </MenuItem>
        </MenuGrid>

        <div style={{ textAlign: 'center' }}>
          <Logout onClick={() => { logout(); nav('/login', { replace: true }) }}>↗ Выйти из аккаунта</Logout>
          <div style={{ marginTop: 14, color: '#6B7280', fontSize: 12 }}>Версия 1.0.0</div>
        </div>
      </PageInner>
    </PageBg>
  )
}
