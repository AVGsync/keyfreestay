import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../contexts/AuthContext'

const Bar = styled.header`
  background: #fff;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSoft};
  position: sticky; top: 0; z-index: 20;
`
const Inner = styled.div`
  max-width: 1400px; margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex; align-items: center; gap: 8px;
  @media (max-width: 640px) { padding: 0 16px; height: 56px; }
`
const Crumb = styled.span`
  font-weight: 700; font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: inline-flex; align-items: center; gap: 8px;
  &::before {
    content: '/';
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 400; margin-right: 2px;
  }
  @media (max-width: 640px) { font-size: 14px; }
`
const Spacer = styled.div` flex: 1; `
const IconBtn = styled(Link)`
  width: 40px; height: 40px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  &:hover { background: ${({ theme }) => theme.colors.bgSoft}; }
`

const I = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>{d}</svg>
)
const HeartIcon = () => <I d={<path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.7l-1.06-1.1a5.5 5.5 0 1 0-7.78 7.8l1.06 1.05L12 21.23l7.78-7.78 1.06-1.05a5.5 5.5 0 0 0 0-7.78Z" />} />
const CalIcon = () => <I d={<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>} />
const UserIcon = () => <I d={<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>} />
const DollarIcon = () => <I d={<path d="M12 3v18M16 7H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8" />} />

export default function Header({ title }) {
  const { viewRole } = useAuth()
  const isOwner = viewRole === 'owner'
  const home = isOwner ? '/owner' : '/app'
  return (
    <Bar>
      <Inner>
        <Link to={home}><Logo /></Link>
        {title && <Crumb>{title}</Crumb>}
        <Spacer />
        {!isOwner && <IconBtn to="/app/favorites" title="Избранное"><HeartIcon /></IconBtn>}
        <IconBtn to={isOwner ? '/owner/bookings' : '/app/bookings'} title="Бронирования"><CalIcon /></IconBtn>
        {isOwner && <IconBtn to="/owner/finance" title="Финансы"><DollarIcon /></IconBtn>}
        <IconBtn to={isOwner ? '/owner/profile' : '/app/profile'} title="Профиль"><UserIcon /></IconBtn>
      </Inner>
    </Bar>
  )
}
