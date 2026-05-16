import { useState } from 'react'
import styled from 'styled-components'

const Wrap = styled.div`
  position: absolute; top: calc(100% + 4px); left: 0;
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 12px 32px rgba(15,23,42,0.12);
  padding: 14px; z-index: 30; width: 280px;
`
const Head = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 4px 12px;
  button { background: none; border: none; cursor: pointer; color: #6B7280; font-size: 18px; padding: 4px 8px; }
  .m { font-weight: 700; font-size: 14px; color: #0F172A; text-transform: capitalize; }
`
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
  .d { font-size: 11px; color: #99A1AF; text-align: center; padding: 4px 0; text-transform: uppercase; }
`
const Cell = styled.button`
  height: 32px; border: none; background: none; cursor: pointer;
  border-radius: 50%;
  font-size: 13px;
  color: ${({ $past, $sel, theme }) => $sel ? '#fff' : $past ? '#CBD5E1' : theme.colors.textPrimary};
  background: ${({ $sel, theme }) => $sel ? theme.colors.primarySolid : 'transparent'};
  border: ${({ $today, $sel, theme }) => $today && !$sel ? `1px solid ${theme.colors.primarySolid}` : '1px solid transparent'};
  &:hover:not(:disabled) { background: ${({ $sel, theme }) => $sel ? theme.colors.primarySolid : theme.colors.bgSoft}; }
  &:disabled { cursor: not-allowed; }
`
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

export default function Calendar({ value, onChange, min }) {
  const today = new Date()
  const init = value ? new Date(value) : today
  const [m, setM] = useState(new Date(init.getFullYear(), init.getMonth(), 1))

  const first = new Date(m.getFullYear(), m.getMonth(), 1)
  const last = new Date(m.getFullYear(), m.getMonth() + 1, 0)
  const startDow = (first.getDay() + 6) % 7
  const days = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(d)

  const minDate = min ? new Date(min) : new Date(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <Wrap>
      <Head>
        <button onClick={() => setM(new Date(m.getFullYear(), m.getMonth() - 1, 1))}>‹</button>
        <span className="m">{MONTHS[m.getMonth()]} {m.getFullYear()}</span>
        <button onClick={() => setM(new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
      </Head>
      <Grid>
        {['пн','вт','ср','чт','пт','сб','вс'].map(d => <div className="d" key={d}>{d}</div>)}
        {days.map((d, i) => {
          if (d == null) return <div key={i} />
          const dt = new Date(m.getFullYear(), m.getMonth(), d)
          const past = dt < minDate
          const sel = value && new Date(value).toDateString() === dt.toDateString()
          const isToday = dt.toDateString() === today.toDateString()
          return (
            <Cell key={i} disabled={past} $past={past} $sel={sel} $today={isToday}
              onClick={() => onChange?.(dt)}>{d}</Cell>
          )
        })}
      </Grid>
    </Wrap>
  )
}
