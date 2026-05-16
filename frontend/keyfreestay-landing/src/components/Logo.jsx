import styled from 'styled-components'

const Wrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: ${({ $size }) => $size === 'sm' ? '18px' : '22px'};
  letter-spacing: 0.04em;
`

const Text = styled.span`
  background: ${({ theme }) => theme.gradients.brand};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

function HouseIcon({ size }) {
  const s = size === 'sm' ? 22 : 30
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={{ flex: 'none' }}>
      <path d="M4 17 L16 5 L28 17 V29 H4 Z" fill="#FCA17B" />
      <rect x="22" y="9" width="3" height="6" fill="#E26A3F" />
      <path d="M7 17 L16 9 L25 17 V28 H7 Z" fill="#FED7AA" />
      <rect x="13" y="20" width="6" height="8" rx="0.5" fill="#7C3A0E" />
      <rect x="9" y="19" width="3" height="3" fill="#7C3A0E" />
      <rect x="20" y="19" width="3" height="3" fill="#7C3A0E" />
    </svg>
  )
}

export default function Logo({ size = 'md' }) {
  return (
    <Wrap $size={size}>
      <HouseIcon size={size} />
      <Text>КЕЙФРИСТЕЙ</Text>
    </Wrap>
  )
}
