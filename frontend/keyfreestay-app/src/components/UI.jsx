import styled, { css } from 'styled-components'

export const PageBg = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.gradients.pageBg};
`
export const PageInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  @media (max-width: 640px) { padding: 16px; }
`
export const PageTitle = styled.h1`
  font-size: 24px; font-weight: 800; letter-spacing: -0.01em;
  display: flex; align-items: center; gap: 8px;
`
export const BackLink = styled.button`
  background: none; border: none; cursor: pointer;
  color: ${({ theme }) => theme.colors.primarySolid};
  font-weight: 600; font-size: 14px;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0; margin-bottom: 24px;
  &:hover { text-decoration: underline; }
`

export const Card = styled.section`
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ $pad = '24px' }) => $pad};
`

export const Field = styled.div`
  display: grid; gap: 6px;
  margin-bottom: 16px;
`
export const Label = styled.label`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
`
export const Hint = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`
export const ErrorText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
`

const inputBase = css`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: inherit;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;
  transition: border-color 120ms ease, box-shadow 120ms ease;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
  &:focus { border-color: ${({ theme }) => theme.colors.primarySolid}; box-shadow: 0 0 0 4px rgba(42,141,255,0.12); }
  &:disabled { background: ${({ theme }) => theme.colors.bgSoft}; color: ${({ theme }) => theme.colors.textMuted}; }
`
export const Input = styled.input` ${inputBase}; `
export const Textarea = styled.textarea` ${inputBase}; height: auto; min-height: 90px; padding: 10px 14px; resize: vertical; `

export const InputWithIcon = styled.div`
  position: relative;
  input { padding-left: 42px; }
  > svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.textMuted}; pointer-events: none; }
`

export const Badge = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 12px; font-weight: 600;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'success': return `background:${theme.colors.successSoft}; color:${theme.colors.success};`
      case 'info':    return `background:${theme.colors.infoSoft};    color:${theme.colors.info};`
      case 'warning': return `background:${theme.colors.warningSoft}; color:${theme.colors.warning};`
      case 'danger':  return `background:${theme.colors.dangerSoft};  color:${theme.colors.danger};`
      default:        return `background:${theme.colors.bgSoft};      color:${theme.colors.textSecondary};`
    }
  }}
`

export const PillTabs = styled.div`
  background: ${({ theme }) => theme.colors.bgSoft};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 4px;
  display: inline-flex; gap: 4px;
`
export const PillTab = styled.button`
  border: none; cursor: pointer; font-family: inherit;
  padding: 10px 28px;
  font-size: 14px; font-weight: 600;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active, theme }) => $active ? theme.colors.primarySolid : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.textSecondary};
  transition: background 120ms ease, color 120ms ease;
  &:hover:not(:disabled) { color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.textPrimary}; }
`

export const GradientTabs = styled.div`
  display: inline-flex; padding: 4px;
  background: ${({ theme }) => theme.colors.bgSoft};
  border-radius: ${({ theme }) => theme.radii.pill};
  gap: 4px;
`
export const GradientTab = styled.button`
  border: none; cursor: pointer; font-family: inherit;
  padding: 10px 32px;
  font-size: 14px; font-weight: 600;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active, theme }) => $active ? theme.gradients.brand : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.textSecondary};
  box-shadow: ${({ $active }) => $active ? '0 6px 16px rgba(42,141,255,0.25)' : 'none'};
  transition: 120ms ease;
`

export const Toggle = styled.button`
  width: 44px; height: 26px; border-radius: 999px;
  border: none; cursor: pointer; position: relative;
  background: ${({ $on, theme }) => $on ? theme.gradients.brand : theme.colors.disabled};
  transition: background 160ms ease;
  flex: none;
  &::after {
    content: ''; position: absolute; top: 3px; left: ${({ $on }) => $on ? '21px' : '3px'};
    width: 20px; height: 20px; border-radius: 50%;
    background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: left 160ms ease;
  }
`

export const Stat = styled.div`
  background: ${({ theme }) => theme.gradients.statCard};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 28px 24px;
  text-align: center;
  .v { font-size: 32px; font-weight: 800; color: #0F766E; letter-spacing: -0.02em; }
  .l { font-size: 14px; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 4px; }
`

export const FormRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`
