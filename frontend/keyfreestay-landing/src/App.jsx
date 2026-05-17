import { useState, useEffect, useRef, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import Logo from './components/Logo'
import PrimaryButton from './components/PrimaryButton'
import { media } from './styles/theme'
import { sendContact } from './api'

const PageWrap = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(60% 50% at 12% 18%, rgba(5,223,114,0.18), transparent 70%),
    radial-gradient(60% 50% at 88% 78%, rgba(42,141,255,0.18), transparent 70%),
    linear-gradient(180deg, #F1FBF5 0%, #FFFFFF 30%, #EEF4FC 100%);
`

const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 32px;
  ${media.mobile} { padding: 0 16px; }
`

const HeaderBar = styled.header`
  position: sticky; top: 0; z-index: 10;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
`
const HeaderInner = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  height: 72px;
`
const Nav = styled.nav`
  display: flex; align-items: center; gap: 32px;
  ${media.tablet} { display: none; }
  a { font-weight: 500; color: ${({ theme }) => theme.colors.textSecondary}; }
  a:hover { color: ${({ theme }) => theme.colors.primarySolid}; }
`

const HeroSection = styled.section`
  background: linear-gradient(135deg, #E6F8EC 0%, #E1ECFB 100%);
  padding: 64px 0 64px;
  margin-bottom: 48px;
  ${media.tablet} { padding: 48px 0; }
`
const HeroGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 32px;
  display: grid; grid-template-columns: 1.05fr 1fr;
  gap: 48px; align-items: center;
  ${media.tablet} { grid-template-columns: 1fr; padding-right: 32px; }
  ${media.mobile} { padding-left: 16px; padding-right: 16px; }
`
const HeroTitle = styled.h1`
  font-size: clamp(28px, 4.5vw, 44px);
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-bottom: 16px;
  color: #0F172A;
`
const HeroLead = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 28px;
  max-width: 520px;
`
const HeroBtn = styled.a`
  display: inline-flex; align-items: center; justify-content: center;
  padding: 16px 28px;
  background: ${({ theme }) => theme.gradients.brand};
  color: #fff; font-weight: 700; font-size: 15px;
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(42,141,255,0.25);
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
  &:hover { transform: translateY(-2px); filter: brightness(1.06); box-shadow: 0 18px 36px rgba(42,141,255,0.32); }
  &:active { transform: translateY(0); }
`
const HeroMain = styled.img`
  display: block; width: 100%; height: auto;
  max-width: 440px; margin-left: auto;
  ${media.tablet} { max-width: 360px; margin: 0 auto; }
`

const Section = styled.section`
  padding: 80px 0;
  ${media.tablet} { padding: 56px 0; }
`
const SectionTitle = styled.h2`
  font-size: clamp(26px, 3.3vw, 38px);
  font-weight: 800; text-align: center; letter-spacing: -0.01em;
  margin-bottom: 12px; color: #0F172A;
`
const SectionLead = styled.p`
  font-size: 15px; color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center; max-width: 720px; margin: 0 auto 40px;
`

const ProbGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
  ${media.desktop} { grid-template-columns: repeat(2, 1fr); }
  ${media.mobile} { grid-template-columns: 1fr; }
`
const ProbCard = styled.article`
  background: #FEECEC;
  border-radius: 16px;
  padding: 24px;
  transition: transform 260ms ease, box-shadow 260ms ease;
  &:hover { transform: translateY(-4px); box-shadow: 0 18px 36px rgba(15,23,42,0.08); }
  .icon { width: 36px; height: 36px; border-radius: 10px;
    background: #FFD6D6; color: #DC2626;
    display: inline-flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
    transition: transform 260ms ease;
  }
  &:hover .icon { transform: scale(1.08); }
  h3 { font-size: 16px; font-weight: 800; margin-bottom: 8px; color: #0F172A; }
  p { font-size: 13px; line-height: 1.5; color: ${({ theme }) => theme.colors.textSecondary}; }
`
const ProbBanner = styled.div`
  margin-top: 28px; padding: 18px 28px;
  border: 1px solid transparent;
  background:
    linear-gradient(#fff, #fff) padding-box,
    ${({ theme }) => theme.gradients.brand} border-box;
  border-radius: 999px;
  text-align: center;
  font-size: 14px; color: #4A5565;
  strong { background: ${({ theme }) => theme.gradients.brand}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }
`

const FeaturesSection = styled(Section)`
  position: relative;
  padding-bottom: 0;
`
const FeaturesRow = styled.div`
  max-width: 1200px; width: 100%;
  margin: 32px auto 0;
  padding: 0 32px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 40px;
  ${media.tablet} { flex-direction: column; gap: 24px; padding: 0 16px; justify-content: center; }
  ${media.mobile} { padding: 0 16px; }
`
const LeftPhoneImg = styled.img`
  display: block; width: 100%; height: auto;
  max-width: 620px; flex: 1 1 620px;
  ${media.tablet} { max-width: 480px; }
`
const RightPhoneImg = styled.img`
  display: block; width: 100%; max-width: 360px; height: auto;
  flex: 0 0 360px;
  margin-right: 48px;
  filter: drop-shadow(0 30px 60px rgba(27,58,107,0.18));
  ${media.tablet} { flex: 0 0 280px; margin-right: 0; }
`
// ── manual swipe phone carousel ──────────────────────────────────────────
const CarouselWrap = styled.div`
  position: relative;
  width: 100%;
  margin: 64px 0 0;
`
const Scroller = styled.div`
  display: flex; gap: 36px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 28px max(8vw, 32px);
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-overflow-scrolling: touch;
  mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%);
  &::-webkit-scrollbar { display: none; }
  &.dragging { cursor: grabbing; scroll-behavior: auto; }
  &.dragging * { pointer-events: none; }
  ${media.mobile} { gap: 18px; padding: 20px 16px; }
`
const PhoneCard = styled.div`
  position: relative;
  flex: 0 0 auto;
  width: 280px;
  aspect-ratio: 171 / 346;
  background: url('/refs/scrolling/base-phone.png') center / contain no-repeat;
  scroll-snap-align: center;
  filter: drop-shadow(0 24px 40px rgba(15,23,42,0.18));
  transition: transform 420ms cubic-bezier(.2,.7,.2,1), filter 420ms ease;
  &:hover { transform: translateY(-6px) scale(1.02); }
  ${media.mobile} { width: 220px; }
  img.screen {
    position: absolute;
    top: 2.3%; left: 5.2%;
    width: 89.6%; height: 95.8%;
    object-fit: cover;
    border-radius: 36px;
    pointer-events: none;
    ${media.mobile} { border-radius: 26px; }
  }
`
const ArrowBtn = styled.button`
  position: absolute;
  top: 50%; transform: translateY(-50%);
  ${({ $right }) => $right ? 'right: 24px;' : 'left: 24px;'}
  width: 48px; height: 48px; border-radius: 50%;
  background: #fff;
  border: 1px solid rgba(15,23,42,0.08);
  box-shadow: 0 8px 24px rgba(15,23,42,0.10);
  color: #0F172A;
  font-size: 22px; font-weight: 700;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  z-index: 2;
  transition: transform 200ms ease, box-shadow 200ms ease;
  &:hover { transform: translateY(-50%) scale(1.06); box-shadow: 0 14px 32px rgba(15,23,42,0.16); }
  &:active { transform: translateY(-50%) scale(0.98); }
  ${media.mobile} { display: none; }
`

const HowGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  ${media.desktop} { grid-template-columns: repeat(2, 1fr); }
  ${media.mobile} { grid-template-columns: 1fr; }
`
const HowCard = styled.article`
  background: ${({ $bg }) => $bg};
  border-radius: 16px; padding: 24px;
  position: relative; min-height: 180px;
  transition: transform 260ms ease, box-shadow 260ms ease;
  &:hover { transform: translateY(-4px); box-shadow: 0 18px 36px rgba(15,23,42,0.08); }
  .num { font-size: 44px; font-weight: 800; line-height: 1;
    color: ${({ $accent }) => $accent}; margin-bottom: 16px; }
  .ic { position: absolute; top: 20px; right: 20px;
    width: 38px; height: 38px; border-radius: 10px;
    background: ${({ $accent }) => $accent}; color: #fff;
    display: inline-flex; align-items: center; justify-content: center;
  }
  h3 { font-size: 15px; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
  p { font-size: 12px; line-height: 1.45; color: ${({ theme }) => theme.colors.textSecondary}; }
`
const HowBanner = styled.div`
  margin-top: 24px; padding: 14px 24px;
  border: 1px solid transparent;
  background:
    linear-gradient(#F1FBF5, #F1FBF5) padding-box,
    ${({ theme }) => theme.gradients.brand} border-box;
  border-radius: 999px;
  text-align: center; font-size: 13px; font-weight: 500; color: #0F172A;
`

const PriceGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  ${media.tablet} { grid-template-columns: 1fr; }
`
const PriceCard = styled.div`
  background: ${({ $f, theme }) => $f ? theme.gradients.brand : '#fff'};
  color: ${({ $f }) => $f ? '#fff' : '#0F172A'};
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: ${({ $f }) => $f ? '0 24px 50px rgba(42,141,255,0.28)' : '0 8px 24px rgba(27,58,107,0.06)'};
  display: flex; flex-direction: column;
  transition: transform 280ms ease, box-shadow 280ms ease;
  &:hover { transform: translateY(-6px); box-shadow: ${({ $f }) => $f ? '0 32px 60px rgba(42,141,255,0.36)' : '0 20px 40px rgba(27,58,107,0.10)'}; }
  h3 { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
  .s { font-size: 13px; opacity: 0.7; margin-bottom: 24px; }
  ul { list-style: none; padding: 0; margin: 0 0 24px; display: grid; gap: 10px; flex: 1; }
  li { font-size: 13px; display: flex; gap: 8px; align-items: flex-start; }
  li::before { content: '✓'; color: ${({ $f }) => $f ? '#fff' : '#16A34A'}; font-weight: 800; flex: none; }
  .p { font-size: 32px; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em; display: flex; align-items: baseline; gap: 8px; }
  .p small { font-size: 13px; font-weight: 500; opacity: 0.8; }
  .btn { padding: 14px; border-radius: 12px; text-align: center;
    background: ${({ $f }) => $f ? '#fff' : 'linear-gradient(90deg, #05DF72, #2A8DFF)'};
    color: ${({ $f, theme }) => $f ? theme.colors.primarySolid : '#fff'};
    font-weight: 700; font-size: 14px; cursor: pointer;
    &:hover { filter: brightness(1.05); }
  }
`

const ContactWrap = styled(Section)``
const ContactGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: stretch;
  ${media.tablet} { grid-template-columns: 1fr; }
`
const ContactLeft = styled.div`
  background: #F8FAFC;
  border: 1px dashed #C7D2FE;
  border-radius: 20px;
  padding: 36px;
  h2 { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
  .lead { color: ${({ theme }) => theme.colors.textSecondary}; margin-bottom: 24px; font-size: 14px; }
`
const BulletList = styled.div` display: grid; gap: 22px; margin-top: 8px; `
const Bullet = styled.div`
  display: grid; grid-template-columns: 52px 1fr; gap: 16px; align-items: flex-start;
  transition: transform 220ms ease;
  &:hover { transform: translateX(4px); }
  .ic {
    width: 52px; height: 52px; border-radius: 14px;
    background: ${({ $tint }) => $tint};
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 26px; line-height: 1;
    box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  }
  h4 { font-size: 15px; font-weight: 800; margin-bottom: 6px; color: #0F172A; }
  p  { font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary}; line-height: 1.5; }
`
const ContactCard = styled.div`
  background: #3B82F6;
  border-radius: 20px;
  padding: 36px;
  color: #fff;
  display: flex; flex-direction: column; justify-content: center;
  input { width: 100%; padding: 15px 16px;
    border: none; border-radius: 10px;
    background: #fff; color: #0F172A;
    font-family: inherit; font-size: 14px;
    margin-bottom: 16px; outline: none;
    transition: box-shadow 200ms ease;
    &:focus { box-shadow: 0 0 0 3px rgba(255,255,255,0.4); }
    &::placeholder { color: #94A3B8; }
  }
  label { font-size: 13px; font-weight: 600; margin-bottom: 6px; display: block; }
  button { width: 100%; padding: 16px;
    background: #2563EB; color: #fff;
    border: none;
    border-radius: 10px; font-weight: 700;
    cursor: pointer; font-size: 14px;
    margin-top: 8px;
    transition: background 200ms ease, transform 160ms ease, box-shadow 200ms ease;
    &:hover { background: #1D4ED8; transform: translateY(-1px); box-shadow: 0 14px 28px rgba(29,78,216,0.35); }
    &:active { transform: translateY(0); }
    &:disabled { opacity: .7; cursor: not-allowed; transform: none; }
  }
  .agree { font-size: 11px; opacity: 0.92; margin-top: 12px; text-align: center; }
`
const Success = styled.div`
  background: #DCFCE7; color: #16A34A;
  padding: 12px 14px; border-radius: 12px;
  font-size: 13px; font-weight: 600; text-align: center;
`

const Footer = styled.footer`
  background: #0F172A;
  color: rgba(255,255,255,0.75);
  padding: 48px 0 32px;
  margin-top: 32px;
`
const FootCols = styled.div`
  display: grid; grid-template-columns: 1.4fr repeat(2, 1fr); gap: 36px;
  ${media.tablet} { grid-template-columns: 1fr 1fr; }
  ${media.mobile} { grid-template-columns: 1fr; }
`
const FCol = styled.div`
  h4 { color: #fff; font-size: 13px; font-weight: 700; margin-bottom: 14px; }
  ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
  a { font-size: 14px; color: rgba(255,255,255,0.7); cursor: pointer; }
  a:hover { color: #fff; }
`
const FootDisclaim = styled.div`
  margin-top: 36px; padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center;
  font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.5;
  ${media.tablet} { grid-template-columns: 1fr; }
`
const Partners = styled.div`
  display: inline-flex; gap: 16px; align-items: center;
  img { height: 64px; width: auto; display: block; }
`
const Copy = styled.div`
  text-align: center; margin-top: 24px;
  font-size: 12px; color: rgba(255,255,255,0.45);
`

const Ico = ({ d, w = 18, h = 18 }) => (
  <svg viewBox="0 0 24 24" width={w} height={h} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)
const IClock = () => <Ico d={<><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></>} />
const ICalCheck = () => <Ico d={<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M9 15l2 2 4-4" /></>} />
const IChat = () => <Ico d={<path d="M21 12a8 8 0 0 1-12.3 6.8L4 20l1.3-4.5A8 8 0 1 1 21 12Z" />} />
const IKey = () => <Ico d={<><circle cx="7" cy="15" r="4" /><path d="m10.5 12 8.5-8M16 7l2 2M14 9l2 2" /></>} />
const ISearch = () => <Ico d={<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>} />
const IWave = () => <Ico d={<><rect x="9" y="3" width="6" height="18" rx="1.5" /><circle cx="12" cy="18" r="0.8" fill="currentColor" /><path d="M18 9c1.5 1.5 1.5 4.5 0 6M20.5 7c2.5 2.5 2.5 7.5 0 10" /></>} />

function PhoneCarousel() {
  const screens = [1, 2, 3, 4, 5, 6]
  const ref = useRef(null)
  const drag = useRef({ down: false, x0: 0, sx0: 0, moved: false })

  const onDown = useCallback((e) => {
    const el = ref.current
    if (!el) return
    drag.current = { down: true, x0: e.clientX, sx0: el.scrollLeft, moved: false }
    el.classList.add('dragging')
    el.setPointerCapture?.(e.pointerId)
  }, [])

  const onMove = useCallback((e) => {
    const el = ref.current
    const d = drag.current
    if (!el || !d.down) return
    const dx = e.clientX - d.x0
    if (Math.abs(dx) > 4) d.moved = true
    el.scrollLeft = d.sx0 - dx
  }, [])

  const onUp = useCallback((e) => {
    const el = ref.current
    if (!el) return
    drag.current.down = false
    el.classList.remove('dragging')
    try { el.releasePointerCapture?.(e.pointerId) } catch {}
  }, [])

  const onClickCapture = useCallback((e) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation() }
  }, [])

  const scrollByDir = useCallback((dir) => {
    const el = ref.current
    if (!el) return
    const first = el.querySelector('.phone-card')
    const step = first ? first.offsetWidth + 36 : 320
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  return (
    <CarouselWrap>
      <ArrowBtn onClick={() => scrollByDir(-1)} aria-label="Назад">‹</ArrowBtn>
      <Scroller
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={onClickCapture}
      >
        {screens.map((n) => (
          <PhoneCard key={n} className="phone-card">
            <img className="screen" src={`/refs/scrolling/screen${n}.png`} alt="" loading="lazy" draggable={false} />
          </PhoneCard>
        ))}
      </Scroller>
      <ArrowBtn $right onClick={() => scrollByDir(1)} aria-label="Вперёд">›</ArrowBtn>
    </CarouselWrap>
  )
}

function useRevealAll() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.revealed)')
    if (!els.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function ContactForm() {
  const [data, setData] = useState({ name: '', email: '', phone: '' })
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    try { await sendContact(data); setSent(true) }
    catch { setErr('Не удалось отправить. Попробуйте позже.') }
    finally { setBusy(false) }
  }

  if (sent) return (
    <ContactCard>
      <Success>Спасибо! Мы свяжемся с вами в ближайшее время.</Success>
    </ContactCard>
  )

  return (
    <ContactCard>
      <form onSubmit={submit}>
        <label>Имя</label>
        <input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="Иван Иванов" required minLength={2} />
        <label>Email</label>
        <input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} placeholder="ivan@example.com" required />
        <label>Телефон</label>
        <input value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} placeholder="+7 (999) 123-45-67" required minLength={5} />
        {err && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{err}</div>}
        <button type="submit" disabled={busy}>{busy ? 'Отправляем…' : 'Отправить заявку'}</button>
        <div className="agree">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</div>
      </form>
    </ContactCard>
  )
}

export default function App() {
  useRevealAll()
  return (
    <PageWrap>
      <HeaderBar>
        <Container>
          <HeaderInner>
            <Logo />
            <Nav>
              <a href="#features">Возможности</a>
              <a href="#how">Функционал</a>
              <a href="#pricing">Тарифы</a>
              <a href="#contact">Связаться с нами</a>
            </Nav>
          </HeaderInner>
        </Container>
      </HeaderBar>

      <HeroSection>
        <HeroGrid>
          <div>
            <HeroTitle>НАЙДИТЕ ИДЕАЛЬНОЕ ЖИЛЬЁ ОНЛАЙН</HeroTitle>
            <HeroLead>Платформа для поиска и аренды жилья с технологией «умный дом» и бесконтактным заселением</HeroLead>
            <HeroBtn href="#contact">Попробовать бесплатно</HeroBtn>
          </div>
          <HeroMain src="/refs/main.svg" alt="Превью приложения" />
        </HeroGrid>
      </HeroSection>

      <Section id="problems">
        <Container>
          <SectionTitle>Проблемы современного рынка аренды</SectionTitle>
          <SectionLead>Традиционные способы поиска и аренды недвижимости создают множество сложностей для арендаторов и арендодателей</SectionLead>
          <ProbGrid className="reveal">
            <ProbCard>
              <div className="icon"><IClock /></div>
              <h3>Долгий поиск</h3>
              <p>Поиск подходящего жилья занимает недели, а иногда и месяцы</p>
            </ProbCard>
            <ProbCard>
              <div className="icon"><ICalCheck /></div>
              <h3>Непрозрачность условий</h3>
              <p>Скрытые комиссии, неясные условия договора и непроверенные объявления</p>
            </ProbCard>
            <ProbCard>
              <div className="icon"><IChat /></div>
              <h3>Риски мошенничества</h3>
              <p>Фальшивые объявления и недобросовестные арендодатели</p>
            </ProbCard>
            <ProbCard>
              <div className="icon"><IKey /></div>
              <h3>Сложность заселения</h3>
              <p>Необходимость личного присутствия для осмотра и получения ключей</p>
            </ProbCard>
          </ProbGrid>
          <ProbBanner><strong>КЕЙФРИСТЕЙ</strong> решает эти проблемы с помощью современных технологий и автоматизации</ProbBanner>
        </Container>
      </Section>

      <FeaturesSection id="features">
        <Container>
          <SectionTitle>Возможности платформы</SectionTitle>
          <SectionLead>Всё необходимое для быстрого и безопасного поиска идеального жилья</SectionLead>
        </Container>
        <FeaturesRow className="reveal">
          <LeftPhoneImg src="/refs/left_phone.svg" alt="Возможности приложения" />
          <RightPhoneImg src="/refs/phone1.svg" alt="Превью карточки объекта" />
        </FeaturesRow>
        <Container>
          <PhoneCarousel />
        </Container>
      </FeaturesSection>

      <Section id="how">
        <Container>
          <SectionTitle>Как это работает</SectionTitle>
          <SectionLead>Простой и прозрачный процесс от поиска до заселения</SectionLead>
          <HowGrid className="reveal">
            <HowCard $bg="#D5F5E8" $accent="#16A34A">
              <div className="ic"><IClock /></div>
              <div className="num">01</div>
              <h3>Долгий поиск</h3>
              <p>Поиск подходящего жилья занимает недели, а иногда и месяцы</p>
            </HowCard>
            <HowCard $bg="#DCE9F9" $accent="#2A8DFF">
              <div className="ic"><ICalCheck /></div>
              <div className="num">02</div>
              <h3>Непрозрачность условий</h3>
              <p>Скрытые комиссии, неясные условия договора и непроверенные объявления</p>
            </HowCard>
            <HowCard $bg="#E4DEF7" $accent="#8A38F5">
              <div className="ic"><IChat /></div>
              <div className="num">03</div>
              <h3>Риски мошенничества</h3>
              <p>Фальшивые объявления и недобросовестные арендодатели</p>
            </HowCard>
            <HowCard $bg="#FBE3D2" $accent="#F97316">
              <div className="ic"><IKey /></div>
              <div className="num">04</div>
              <h3>Сложность заселения</h3>
              <p>Необходимость личного присутствия для осмотра и получения ключей</p>
            </HowCard>
          </HowGrid>
          <HowBanner>Средний срок от поиска до заселения — 3 дня</HowBanner>
        </Container>
      </Section>

      <Section id="pricing">
        <Container>
          <SectionTitle>Выберите свой тариф</SectionTitle>
          <SectionLead>Гибкие условия для арендаторов, владельцев и управляющих компаний</SectionLead>

          <PriceGrid className="reveal">
            <PriceCard>
              <h3>Для арендаторов</h3>
              <div className="s">Поиск и аренда жилья</div>
              <ul>
                <li>Неограниченный поиск объектов</li>
                <li>Доступ к отзывам и рейтингам</li>
                <li>Онлайн-бронирование</li>
                <li>Чат с арендодателями</li>
                <li>История аренды</li>
              </ul>
              <div className="p">Бесплатно<small>навсегда</small></div>
              <a className="btn" href="#contact">Начать бесплатно</a>
            </PriceCard>

            <PriceCard $f>
              <h3>Для арендодателей</h3>
              <div className="s" style={{ color: 'rgba(255,255,255,0.85)' }}>Размещение объявлений</div>
              <ul>
                <li>Размещение до 10 объектов</li>
                <li>Проверка арендаторов</li>
                <li>Автоматическое бронирование</li>
                <li>Статистика и аналитика</li>
                <li>Поддержка 24/7</li>
                <li>Интеграция с «умный дом»</li>
                <li>Продвижение объявлений</li>
              </ul>
              <div className="p">₽999<small>/за объект в месяц</small></div>
              <a className="btn" href="#contact">Выбрать тариф</a>
            </PriceCard>

            <PriceCard>
              <h3>Для управляющих компаний</h3>
              <div className="s">Комплексное решение</div>
              <ul>
                <li>Неограниченное кол-во объектов</li>
                <li>API для интеграции</li>
                <li>Персональный менеджер</li>
                <li>Приоритетная модерация</li>
                <li>Расширенная аналитика</li>
                <li>Обучение сотрудников</li>
                <li>Техническая поддержка</li>
              </ul>
              <div className="p">От ₽49 990</div>
              <a className="btn" href="#contact">Выбрать тариф</a>
            </PriceCard>
          </PriceGrid>
        </Container>
      </Section>

      <ContactWrap id="contact">
        <Container>
          <ContactGrid className="reveal">
            <ContactLeft>
              <h2>Начните прямо сейчас</h2>
              <div className="lead">Оставьте свои контактные данные, и мы свяжемся с вами для бесплатной консультации</div>
              <BulletList>
                <Bullet $tint="#CDEEE3">
                  <div className="ic">🔎</div>
                  <div>
                    <h4>Удобный поиск недвижимости</h4>
                    <p>Подбор жилых и офисных помещений по параметрам: цена, локация, удобства и «умный дом»</p>
                  </div>
                </Bullet>
                <Bullet $tint="#F8D7DD">
                  <div className="ic">📝</div>
                  <div>
                    <h4>Онлайн-бронирование</h4>
                    <p>Выбирайте и бронируйте объекты напрямую через платформу без лишних шагов</p>
                  </div>
                </Bullet>
                <Bullet $tint="#E5D8F7">
                  <div className="ic">💬</div>
                  <div>
                    <h4>Прямое общение с владельцами</h4>
                    <p>Связь с арендодателями без посредников для быстрого решения вопросов</p>
                  </div>
                </Bullet>
                <Bullet $tint="#F8DCC7">
                  <div className="ic">🔑</div>
                  <div>
                    <h4>Бесконтактное заселение</h4>
                    <p>Получайте доступ к помещению удалённо без личной встречи</p>
                  </div>
                </Bullet>
              </BulletList>
            </ContactLeft>
            <ContactForm />
          </ContactGrid>
        </Container>
      </ContactWrap>

      <Footer>
        <Container>
          <FootCols>
            <FCol>
              <div style={{ marginBottom: 16 }}><Logo /></div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 320, lineHeight: 1.5 }}>
                Платформа для поиска и аренды жилья с технологией «умный дом» и бесконтактным заселением
              </p>
            </FCol>
            <FCol>
              <ul style={{ marginTop: 24 }}>
                <li><a href="#problems">Преимущества</a></li>
                <li><a href="#features">Функционал</a></li>
                <li><a href="#pricing">Тарифы</a></li>
                <li><a href="#contact">Оставить заявку</a></li>
              </ul>
            </FCol>
            <FCol />
          </FootCols>

          <FootDisclaim>
            <div>
              «Проект реализован при поддержке Фонда содействия инновациям в рамках программы «Студенческий стартап» мероприятия «Платформа университетского технологического предпринимательства» федерального проекта «Технологии»».
            </div>
            <Partners>
              <img src="/refs/techno.svg" alt="Технологии — федеральный проект" />
              <img src="/refs/fond.svg" alt="Фонд сodействия инновациям" />
            </Partners>
          </FootDisclaim>

          <Copy>© 2025 (ИНН: 2360019272). Все права защищены.</Copy>
        </Container>
      </Footer>
    </PageWrap>
  )
}
