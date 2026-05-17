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
  a { color: inherit; text-decoration: none; transition: color 200ms ease; }
  img { display: block; max-width: 100%; }

  /* reveal-on-scroll */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 700ms ease, transform 700ms cubic-bezier(.2,.7,.2,1);
    will-change: opacity, transform;
  }
  .reveal.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  @media (prefers-reduced-motion: reduce) {
    .reveal, .reveal.revealed { opacity: 1; transform: none; transition: none; }
  }
`
