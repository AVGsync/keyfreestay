import styled, { css } from 'styled-components'

const base = css`
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 14px 28px;
  transition: transform 80ms ease, filter 120ms ease, box-shadow 120ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:active { transform: translateY(1px); }
  &:disabled { cursor: not-allowed; opacity: .6; }
`

export const PrimaryButton = styled.button`
  ${base};
  color: #fff;
  background: ${({ theme }) => theme.gradients.brand};
  box-shadow: 0 6px 18px rgba(42, 141, 255, 0.25);

  &:hover:not(:disabled) { filter: brightness(1.05); box-shadow: 0 8px 22px rgba(42, 141, 255, 0.3); }
  &:disabled { background: ${({ theme }) => theme.colors.disabled}; box-shadow: none; }
`

export const GhostButton = styled.button`
  ${base};
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.bgSoft}; }
`

export default PrimaryButton
