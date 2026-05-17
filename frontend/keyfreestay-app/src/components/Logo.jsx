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
	const s = size === 'sm' ? 18 : 26
	return (
		<span
			style={{
				fontSize: s,
				lineHeight: 1,
				display: 'inline-block',
				flex: 'none',
			}}
			role='img'
			aria-label='house'
		>
			🏠
		</span>
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
