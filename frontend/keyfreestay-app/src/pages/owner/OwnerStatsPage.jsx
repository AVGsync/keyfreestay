import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { housingApi } from '../../api/client'
import { PageBg, PageInner, Card, BackLink, GradientTabs, GradientTab } from '../../components/UI'
import { formatPrice } from '../../utils/format'

const Tabs = styled.div`
  display: flex; justify-content: center; margin-bottom: 16px;
`
const Stats = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  margin-bottom: 16px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`
const StatBox = styled(Card)`
  position: relative;
  .ic { width: 32px; height: 32px; border-radius: 8px;
    background: ${({ $color }) => `${$color}22`}; color: ${({ $color }) => $color};
    display: inline-flex; align-items: center; justify-content: center; font-size: 18px;
  }
  .delta { position: absolute; top: 20px; right: 20px;
    font-size: 12px; font-weight: 700;
    color: ${({ $deltaColor }) => $deltaColor || '#16A34A'};
  }
  .v { font-size: 24px; font-weight: 800; margin-top: 8px; }
  .l { font-size: 13px; color: #6B7280; margin-top: 2px; }
`
const Sec = styled(Card)`
  margin-bottom: 16px;
  h3 { font-size: 15px; font-weight: 800; margin-bottom: 14px; }
`
const Bar = styled.div`
  display: grid; grid-template-columns: 60px 1fr 60px; gap: 12px; align-items: center;
  margin-bottom: 10px; font-size: 12px;
  .m { color: #6B7280; }
  .v { color: #0F172A; font-weight: 700; text-align: right; }
  .bar { height: 8px; border-radius: 4px; background: #E5E7EB; overflow: hidden;
    div { height: 100%; background: linear-gradient(90deg, #05DF72, #2A8DFF); width: ${({ $w }) => $w}%; border-radius: 4px; }
  }
`
const EffGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  > div { background: linear-gradient(135deg, #ECFDF5 0%, #DBEAFE 100%);
    border-radius: 12px; padding: 18px; text-align: center;
    .v { font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.primarySolid}; }
    .l { font-size: 12px; color: #6B7280; margin-top: 4px; }
  }
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`
const Row = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-top: 1px solid #E5E7EB;
  &:first-of-type { border-top: none; padding-top: 0; }
  .a { font-size: 14px; font-weight: 600; }
  .s { font-size: 12px; color: #6B7280; margin-top: 2px; }
  .v { font-weight: 800; font-size: 14px; }
`
const Demog = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  > div { background: #F8FAFC; border-radius: 12px; padding: 18px; text-align: center;
    .v { font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.primarySolid}; }
    .l { font-size: 12px; color: #6B7280; margin-top: 4px; }
  }
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`
const ReviewRow = styled.div`
  padding: 12px 0; border-top: 1px solid #E5E7EB;
  &:first-of-type { border-top: none; padding-top: 0; }
  display: grid; grid-template-columns: 1fr auto; gap: 12px;
  .n { font-weight: 700; font-size: 14px; }
  .d { font-size: 11px; color: #6B7280; margin-top: 2px; }
  .t { font-size: 12px; color: #6B7280; margin-top: 6px; line-height: 1.5; }
  .s { color: #F59E0B; font-size: 14px; }
`
const Reco = styled.div`
  margin-top: 16px;
  background: ${({ theme }) => theme.gradients.brand};
  color: #fff; border-radius: 16px; padding: 18px 22px;
  h4 { font-size: 14px; font-weight: 800; margin-bottom: 10px; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  li { font-size: 12px; opacity: 0.95; padding-left: 14px; position: relative;
    &::before { content: '•'; position: absolute; left: 0; }
  }
`

const MONTHS = [
  { m: 'Янв', v: 320 }, { m: 'Фев', v: 410 }, { m: 'Мар', v: 580 },
  { m: 'Апр', v: 650 }, { m: 'Май', v: 890 }, { m: 'Июн', v: 1247 }
]
const INCOME = [
  { m: 'Апр 2026', n: 5, v: 31500 },
  { m: 'Май 2026', n: 12, v: 42000 },
  { m: 'Июн 2026', n: 15, v: 52500 }
]
const REVIEWS = [
  { n: 'Анна Смирнова', d: '5 апреля 2026', s: 5, t: 'Отличная квартира! Всё на фото идеально, чисто, чисто и уютно. Хозяин внимательный.' },
  { n: 'Дмитрий Петров', d: '20 марта 2026', s: 5, t: 'Прекрасное расположение, рядом всё необходимое. Рекомендую!' },
  { n: 'Елена Васильева', d: '15 марта 2026', s: 5, t: 'Уютная квартира, но немного шумно от трассы.' }
]

export default function OwnerStatsPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [period, setPeriod] = useState('month')
  const [item, setItem] = useState(null)
  useEffect(() => { housingApi.get(id).then(setItem).catch(() => {}) }, [id])
  const max = Math.max(...MONTHS.map(x => x.v))
  const total = INCOME.reduce((s, x) => s + x.v, 0)

  return (
    <PageBg>
      <Header title="Мои объекты / Статистика" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <Tabs>
            <GradientTabs>
              <GradientTab $active={period === 'week'} onClick={() => setPeriod('week')}>Неделя</GradientTab>
              <GradientTab $active={period === 'month'} onClick={() => setPeriod('month')}>Месяц</GradientTab>
              <GradientTab $active={period === 'year'} onClick={() => setPeriod('year')}>Год</GradientTab>
            </GradientTabs>
          </Tabs>

          <Stats>
            <StatBox $color="#16A34A" $deltaColor="#16A34A"><div className="ic">👁</div><div className="delta">+15%</div><div className="v">1,247</div><div className="l">Просмотры</div></StatBox>
            <StatBox $color="#F97316" $deltaColor="#16A34A"><div className="ic">❤</div><div className="delta">+8%</div><div className="v">89</div><div className="l">В избранном</div></StatBox>
            <StatBox $color="#2A8DFF" $deltaColor="#16A34A"><div className="ic">📅</div><div className="delta">+12%</div><div className="v">23</div><div className="l">Бронирований</div></StatBox>

            <StatBox $color="#16A34A" $deltaColor="#16A34A"><div className="ic">$</div><div className="delta">+15%</div><div className="v">80,500 ₽</div><div className="l">Доход</div></StatBox>
            <StatBox $color="#F59E0B" $deltaColor="#16A34A"><div className="ic">★</div><div className="delta">+0.2</div><div className="v">4.8</div><div className="l">Средний рейтинг</div></StatBox>
            <StatBox $color="#8A38F5" $deltaColor="#16A34A"><div className="ic">↗</div><div className="delta">+1.5%</div><div className="v">71%</div><div className="l">Коэффициент конверсии</div></StatBox>
          </Stats>

          <Sec>
            <h3>Динамика просмотров</h3>
            {MONTHS.map(x => (
              <Bar key={x.m} $w={(x.v / max) * 100}>
                <span className="m">{x.m}</span>
                <div className="bar"><div /></div>
                <span className="v">{x.v}</span>
              </Bar>
            ))}
          </Sec>

          <Sec>
            <h3>Эффективность бронирований</h3>
            <EffGrid>
              <div><div className="v">3.5 ночи</div><div className="l">Средняя продолжительность</div></div>
              <div><div className="v">68%</div><div className="l">Заполняемость</div></div>
              <div><div className="v">12%</div><div className="l">Повторные брони</div></div>
            </EffGrid>
          </Sec>

          <Sec>
            <h3>Доходы за период</h3>
            {INCOME.map(x => (
              <Row key={x.m}>
                <div>
                  <div className="a">{x.m}</div>
                  <div className="s">{x.n} бронирований</div>
                </div>
                <div className="v">{formatPrice(x.v)} ₽</div>
              </Row>
            ))}
            <Row>
              <div className="a">Итого за 6 месяцев:</div>
              <div className="v" style={{ color: '#16A34A' }}>{formatPrice(total)} ₽</div>
            </Row>
          </Sec>

          <Sec>
            <h3>Демография гостей</h3>
            <Demog>
              <div><div className="v">32 года</div><div className="l">Средний возраст</div></div>
              <div><div className="v">2-3 человека</div><div className="l">Средняя группа</div></div>
              <div><div className="v">45%</div><div className="l">Бизнес</div></div>
              <div><div className="v">55%</div><div className="l">Туризм</div></div>
            </Demog>
          </Sec>

          <Sec>
            <h3>Отзывы за период</h3>
            {REVIEWS.map((r, i) => (
              <ReviewRow key={i}>
                <div>
                  <div className="n">{r.n}</div>
                  <div className="d">{r.d}</div>
                  <div className="t">{r.t}</div>
                </div>
                <div className="s">{'★'.repeat(r.s)}</div>
              </ReviewRow>
            ))}
            <Reco>
              <h4>↗ Рекомендации по улучшению</h4>
              <ul>
                <li>Добавьте больше фотографий — объекты с 10+ фото получают на 40% больше просмотров</li>
                <li>Откликайтесь на запросы в течение 1 часа — это увеличивает конверсию на 25%</li>
                <li>Рассмотрите гибкую политику отмены — это привлекает больше бронирований</li>
              </ul>
            </Reco>
          </Sec>
        </div>
      </PageInner>
    </PageBg>
  )
}
