import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { PageBg, PageInner, Card, BackLink, Toggle } from '../../components/UI'

const InfoBanner = styled.div`
  background: rgba(42,141,255,0.08);
  border-radius: 12px; padding: 12px 18px;
  color: ${({ theme }) => theme.colors.primarySolid};
  font-size: 13px; text-align: center;
  margin-bottom: 20px;
`
const Section = styled(Card)`
  margin-bottom: 16px;
  h3 { font-size: 15px; font-weight: 800; margin-bottom: 14px; display: inline-flex; gap: 8px; align-items: center; }
`
const Row = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSoft};
  &:first-of-type { border-top: none; padding-top: 0; }
  .t { font-weight: 600; font-size: 14px; color: #0F172A; }
  .s { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px; }
`

function Item({ title, sub, on, onToggle }) {
  return (
    <Row>
      <div>
        <div className="t">{title}</div>
        <div className="s">{sub}</div>
      </div>
      <Toggle $on={on} onClick={onToggle} />
    </Row>
  )
}

export default function NotificationsPage() {
  const nav = useNavigate()
  const [s, setS] = useState({
    book_confirm: true, book_remind: true, book_checkin: true, book_checkout: true,
    promo: false, news: false, prices: true,
    review_req: true,
    push: true, email: true, sms: false
  })
  const set = (k) => () => setS(o => ({ ...o, [k]: !o[k] }))

  return (
    <PageBg>
      <Header title="Личный кабинет / Параметры уведомлений" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <InfoBanner>Управляйте способами получения уведомлений. Важные уведомления о бронированиях отключить нельзя.</InfoBanner>

          <Section>
            <h3>🔔 Бронирования</h3>
            <Item title="Подтверждение бронирования" sub="Уведомление при успешном оформлении бронирования" on={s.book_confirm} onToggle={set('book_confirm')} />
            <Item title="Напоминание о бронировании" sub="За 3 дня до заезда" on={s.book_remind} onToggle={set('book_remind')} />
            <Item title="Напоминание о заезде" sub="В день заезда" on={s.book_checkin} onToggle={set('book_checkin')} />
            <Item title="Напоминание о выезде" sub="В день выезда" on={s.book_checkout} onToggle={set('book_checkout')} />
          </Section>

          <Section>
            <h3>📧 Маркетинг</h3>
            <Item title="Специальные предложения" sub="Скидки и акции на жильё" on={s.promo} onToggle={set('promo')} />
            <Item title="Новости и обновления" sub="Информация о новых функциях" on={s.news} onToggle={set('news')} />
            <Item title="Оповещения о ценах" sub="Изменения цен на избранные объекты" on={s.prices} onToggle={set('prices')} />
          </Section>

          <Section>
            <h3>💬 Обратная связь</h3>
            <Item title="Запросы на отзывы" sub="После завершения бронирования" on={s.review_req} onToggle={set('review_req')} />
          </Section>

          <Section>
            <h3>📨 Каналы уведомлений</h3>
            <Item title="Push-уведомления" sub="В мобильном приложении" on={s.push} onToggle={set('push')} />
            <Item title="Email" sub="На почту ivan@example.com" on={s.email} onToggle={set('email')} />
            <Item title="СМС" sub="На номер +7 (999) 123-45-67" on={s.sms} onToggle={set('sms')} />
          </Section>
        </div>
      </PageInner>
    </PageBg>
  )
}
