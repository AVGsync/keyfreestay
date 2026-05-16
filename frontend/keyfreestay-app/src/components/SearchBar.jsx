import styled from 'styled-components'

const Wrap = styled.div`
  display: flex; gap: 12px; align-items: center;
`
const Field = styled.div`
  position: relative; flex: 1;
  height: 52px;
  > svg { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.textMuted}; }
  input {
    width: 100%; height: 100%;
    padding: 0 18px 0 52px;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.borderSoft};
    background: ${({ theme }) => theme.colors.bgSoft};
    font-size: 15px; font-family: inherit; outline: none;
    color: ${({ theme }) => theme.colors.textPrimary};
    &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
    &:focus { border-color: ${({ theme }) => theme.colors.primarySolid}; background: #fff; box-shadow: 0 0 0 4px rgba(42,141,255,0.1); }
  }
`
const FilterBtn = styled.button`
  width: 52px; height: 52px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.primarySolid};
  color: #fff; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(42,141,255,0.3);
  &:hover { filter: brightness(1.05); }
`
const FilterIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h13M3 12h9M3 18h5" /><circle cx="19" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="11" cy="18" r="2" />
  </svg>
)
const Search = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>
)

export default function SearchBar({ value, onChange, onFilter }) {
  return (
    <Wrap>
      <Field>
        <Search />
        <input
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder="Поиск по адресу или названию..."
        />
      </Field>
      <FilterBtn onClick={onFilter} title="Фильтры"><FilterIcon /></FilterBtn>
    </Wrap>
  )
}
