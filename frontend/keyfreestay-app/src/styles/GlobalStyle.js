import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  html { scroll-behavior: smooth; }

  body {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.white};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5, h6 { margin: 0; line-height: 1.2; }
  p { margin: 0; }
  button { font-family: inherit; }
  a { color: inherit; text-decoration: none; transition: color 180ms ease; }
  img { display: block; max-width: 100%; }
  input, textarea, select, button { font-family: inherit; }

  /* page entry */
  @keyframes pageFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  main, [data-page] { animation: pageFadeIn 360ms ease-out both; }

  /* reveal-on-scroll */
  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 600ms ease, transform 600ms cubic-bezier(.2,.7,.2,1);
    will-change: opacity, transform;
  }
  .reveal.revealed { opacity: 1; transform: translateY(0); }
  .reveal.delay-1 { transition-delay: 80ms; }
  .reveal.delay-2 { transition-delay: 160ms; }
  .reveal.delay-3 { transition-delay: 240ms; }

  /* card lift */
  .lift {
    transition: transform 220ms ease, box-shadow 220ms ease;
  }
  .lift:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(15,23,42,0.08); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
    .reveal, .reveal.revealed { opacity: 1; transform: none; }
  }
`
