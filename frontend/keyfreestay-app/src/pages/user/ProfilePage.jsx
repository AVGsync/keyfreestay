import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { bookingApi } from '../../api/client'
import { useFavorites } from '../../utils/favorites'
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
  h3 { font-size: 18px; font-weight: 800; display: inline-flex; align-items: center; gap: 10px; }
  .e { font-size: 13px; color: #6B7280; margin-top: 4px; }
`
const SwitchCard = styled(Card)`
  display: flex; align-items: center; gap: 14px;
  .ic { width: 40px; height: 40px; border-radius: 12px; background: #F1F5F9; display: inline-flex; align-items: center; justify-content: center; color: #6B7280; }
  .t { flex: 1; font-weight: 700; font-size: 14px; }
  .s { font-size: 12px; color: #6B7280; margin-top: 2px; font-weight: 500; }
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
  .s { font-size: 12px; color: #6B7280; margin-top: 2px; font-weight: 500; }
`
const Logout = styled.button`
  display: block; margin: 24px auto 0;
  background: #FEE2E2; color: #DC2626;
  border: none; border-radius: 12px;
  padding: 16px 32px; cursor: pointer;
  font-weight: 700; font-size: 14px;
  display: inline-flex; gap: 8px; align-items: center;
`

const Icon = ({ d }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>

export default function ProfilePage() {
  const nav = useNavigate()
  const { user, logout, switchRole, viewRole } = useAuth()
  const fav = useFavorites()
  const [trips, setTrips] = useState(0)

  useEffect(() => { bookingApi.list().then(r => setTrips((r.items || []).length)).catch(() => {}) }, [])

  if (!user) return null
  const initial = (user.full_name || user.email || 'И').trim().charAt(0).toUpperCase()

  return (
    <PageBg>
      <Header title="Личный кабинет" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>

        <Top>
          <UserCard>
            <div className="av">{initial}</div>
            <div style={{ flex: 1 }}>
              <h3>{user.full_name || 'Пользователь'} <Badge $variant="success">✓ Верифицирован</Badge></h3>
              <div className="e">{user.email}</div>
            </div>
          </UserCard>

          <SwitchCard>
            <div className="ic"><Icon d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>} /></div>
            <div style={{ flex: 1 }}>
              <div className="t">Переключиться на профиль арендодателя</div>
              <div className="s">Управление объектами недвижимости</div>
            </div>
            <Toggle $on={viewRole === 'owner'} onClick={switchRole} />
          </SwitchCard>
        </Top>

        <Stats>
          <Stat><div className="v">{trips}</div><div className="l">Поездок</div></Stat>
          <Stat><div className="v">{fav.ids.length}</div><div className="l">Избранное</div></Stat>
          <Stat><div className="v">4.9</div><div className="l">Рейтинг</div></Stat>
        </Stats>

        <MenuGrid>
          <MenuItem to="/app/profile/edit">
            <div className="ic"><Icon d={<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>} /></div>
            <div><div className="t">Редактировать профиль</div><div className="s">Изменить персональные данные</div></div>
          </MenuItem>
          <MenuItem to="/app/profile/payments">
            <div className="ic"><Icon d={<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>} /></div>
            <div><div className="t">Способы оплаты</div><div className="s">Управление сохранёнными картами</div></div>
          </MenuItem>
          <MenuItem to="/app/profile/notifications">
            <div className="ic"><Icon d={<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>} /></div>
            <div><div className="t">Параметры уведомлений</div><div className="s">Настройка уведомлений</div></div>
          </MenuItem>
          <MenuItem to="/app/profile/support">
            <div className="ic"><Icon d={<><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" /></>} /></div>
            <div><div className="t">Справка и поддержка</div><div className="s">Помощь и часто задаваемые вопросы</div></div>
          </MenuItem>
        </MenuGrid>

        <div style={{ textAlign: 'center' }}>
          <Logout onClick={() => { logout(); nav('/login', { replace: true }) }}>
            <Icon d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>} /> Выйти из аккаунта
          </Logout>
          <div style={{ marginTop: 14, color: '#6B7280', fontSize: 12 }}>Версия 1.0.0</div>
        </div>
      </PageInner>
    </PageBg>
  )
}
