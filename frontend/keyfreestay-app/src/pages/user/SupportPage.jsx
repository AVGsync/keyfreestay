import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../../components/Header'
import { PageBg, PageInner, Card, BackLink, GradientTabs, GradientTab } from '../../components/UI'

const Tabs = styled.div`
  display: flex; justify-content: center; margin-bottom: 16px;
`
const QA = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.borderSoft};
  &:first-of-type { border-top: none; }
  .q {
    width: 100%; background: none; border: none;
    text-align: left; cursor: pointer;
    padding: 16px 0; font-family: inherit;
    font-size: 14px; font-weight: 600; color: #0F172A;
    display: flex; justify-content: space-between; align-items: center;
  }
  .q::after { content: '▾'; color: #94A3B8; transition: transform 160ms ease; }
  .a { padding: 0 0 16px; font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary}; line-height: 1.55; }
  &[data-open='true'] .q::after { transform: rotate(180deg); }
`
const Contacts = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  margin-top: 24px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`
const Contact = styled.div`
  background: #F8FAFC; border-radius: 12px;
  padding: 16px; text-align: center;
  .ic { color: ${({ theme }) => theme.colors.primarySolid}; font-size: 22px; margin-bottom: 6px; }
  .l { font-weight: 700; font-size: 14px; }
  .s { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 4px; }
`
const Docs = styled.ul`
  list-style: none; padding: 0; margin: 14px 0 0;
  display: grid; gap: 12px;
  li { display: flex; gap: 10px; padding: 14px 16px;
    background: #F8FAFC; border-radius: 12px; cursor: pointer;
    .ic { color: ${({ theme }) => theme.colors.primarySolid}; }
    .t { font-weight: 700; font-size: 14px; }
    .s { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px; }
  }
`
const Hours = styled.div`
  margin-top: 20px;
  background: ${({ theme }) => theme.gradients.brand};
  color: #fff; border-radius: 16px;
  padding: 20px; text-align: center;
  h4 { font-size: 14px; font-weight: 800; margin-bottom: 8px; }
  div { font-size: 13px; opacity: 0.92; }
`

const FAQ = [
  { q: 'Как зарегистрироваться в системе?', a: 'Нажмите «Зарегистрироваться» на странице входа, выберите роль (Арендатор или Арендодатель), укажите email и пароль, подтвердите телефон.' },
  { q: 'Как забронировать жильё?', a: 'Откройте карточку объекта, выберите даты заезда и выезда, количество гостей и нажмите «Подтвердить и оплатить». После оплаты бронирование появится в разделе «Мои бронирования».' },
  { q: 'Можно ли отменить бронирование?', a: 'Да. Условия отмены зависят от политики объекта: гибкая (полный возврат за 1 день), умеренная (за 5 дней), строгая (50% за 7 дней).' },
  { q: 'Какие способы оплаты доступны?', a: 'Принимаем банковские карты Visa, Mastercard, МИР, UnionPay. Сохранённые карты управляются в разделе «Способы оплаты».' },
  { q: 'Как добавить свою недвижимость?', a: 'Переключитесь на профиль арендодателя в личном кабинете → «Мои объекты» → «Добавить объект». Заполните основную информацию, удобства, фото и цены.' },
  { q: 'Как получить статус верифицированного арендодателя?', a: 'Загрузите паспорт и селфи в разделе «Подтверждение личности». Проверка занимает до 24 часов.' },
  { q: 'Как изменить личные данные?', a: 'Личный кабинет → «Редактировать профиль». Email изменить нельзя — обратитесь в поддержку.' },
  { q: 'Что делать, если платёж не прошёл?', a: 'Проверьте срок действия карты и достаточность средств. Если проблема сохраняется, напишите в поддержку.' },
  { q: 'Как оставить отзыв о жилье?', a: 'После завершения бронирования в разделе «Мои бронирования» появится кнопка «Оставить отзыв».' },
  { q: 'Как связаться с арендодателем?', a: 'В деталях бронирования нажмите «Связаться с арендодателем» — откроется чат внутри приложения.' }
]

export default function SupportPage() {
  const nav = useNavigate()
  const [tab, setTab] = useState('all')
  const [open, setOpen] = useState({})

  return (
    <PageBg>
      <Header title="Личный кабинет / Справка и поддержка" />
      <PageInner>
        <BackLink onClick={() => nav(-1)}>← Вернуться назад</BackLink>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Tabs>
            <GradientTabs>
              <GradientTab $active={tab === 'all'} onClick={() => setTab('all')}>Все вопросы</GradientTab>
              <GradientTab $active={tab === 'general'} onClick={() => setTab('general')}>Общие вопросы</GradientTab>
              <GradientTab $active={tab === 'book'} onClick={() => setTab('book')}>Бронирование</GradientTab>
              <GradientTab $active={tab === 'pay'} onClick={() => setTab('pay')}>Оплата</GradientTab>
              <GradientTab $active={tab === 'own'} onClick={() => setTab('own')}>Арендодателям</GradientTab>
            </GradientTabs>
          </Tabs>

          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Часто задаваемые вопросы</h3>
            {FAQ.map((it, i) => (
              <QA key={i} data-open={!!open[i]}>
                <button className="q" onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))}>{it.q}</button>
                {open[i] && <div className="a">{it.a}</div>}
              </QA>
            ))}

            <div style={{ marginTop: 24, padding: 20, background: '#F8FAFC', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Не нашли ответ на свой вопрос?</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>Свяжитесь с нами удобным для вас способом, и мы поможем решить вашу проблему</div>
              <Contacts>
                <Contact><div className="ic">💬</div><div className="l">Онлайн-чат</div><div className="s">Ответ за 5 минут</div></Contact>
                <Contact><div className="ic">✉</div><div className="l">Email</div><div className="s">support@homefind.ru</div></Contact>
                <Contact><div className="ic">📞</div><div className="l">Телефон</div><div className="s">8 (800) 555-35-35</div></Contact>
              </Contacts>
            </div>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Полезные материалы 📚</h3>
            <Docs>
              <li><span className="ic">📄</span><div><div className="t">Пользовательское соглашение</div><div className="s">Условия использования сервиса</div></div></li>
              <li><span className="ic">📄</span><div><div className="t">Политика конфиденциальности</div><div className="s">Как мы защищаем ваши данные</div></div></li>
              <li><span className="ic">📄</span><div><div className="t">Гайд для арендодателей</div><div className="s">Как успешно сдавать жильё</div></div></li>
            </Docs>
          </Card>

          <Hours>
            <h4>🕒 Часы работы поддержки</h4>
            <div>Понедельник — Пятница: 9:00 – 21:00</div>
            <div>Суббота — Воскресенье: 10:00 – 18:00</div>
          </Hours>
        </div>
      </PageInner>
    </PageBg>
  )
}
