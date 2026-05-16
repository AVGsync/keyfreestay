import styled from 'styled-components'

export const AuthShell = styled.div`
  min-height: 100vh;
  display: grid; place-items: center;
  padding: 24px;
  background:
    radial-gradient(70% 60% at 12% 30%, rgba(5,223,114,0.22), transparent 70%),
    radial-gradient(70% 60% at 88% 70%, rgba(42,141,255,0.22), transparent 70%),
    #fff;
`

export const AuthCard = styled.div`
  width: 100%; max-width: 440px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 30px 60px rgba(15,23,42,0.08), 0 4px 12px rgba(15,23,42,0.04);
  padding: 32px;
`

export const AuthLogoRow = styled.div`
  display: flex; justify-content: center; margin-bottom: 18px;
`

export const AuthTitle = styled.h1`
  font-size: 24px; font-weight: 800; text-align: center;
  margin-bottom: 6px;
`
export const AuthLead = styled.p`
  font-size: 14px; text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 24px;
`
export const AuthFooterText = styled.div`
  text-align: center; font-size: 14px; margin-top: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  a { color: ${({ theme }) => theme.colors.primarySolid}; font-weight: 600; }
`
export const InlineLink = styled.a`
  color: ${({ theme }) => theme.colors.primarySolid};
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`
