// Design tokens shared with keyfreestay-app
export const theme = {
  colors: {
    // brand gradient endpoints
    brandGreen: '#05DF72',
    brandBlue: '#2A8DFF',
    logoGreen: '#00A63E',
    logoBlue: '#155DFC',

    // primary actions
    primarySolid: '#2A8DFF',

    // neutrals (from UI kit grayscale)
    white: '#FFFFFF',
    bgPage: '#F4F8FC',
    bgSurface: '#FFFFFF',
    bgSoft: '#F9FAFB',
    border: '#E5E7EB',
    borderSoft: '#E2E8F0',
    divider: '#EBEBEB',

    // text
    textPrimary: '#0F172A',
    textSecondary: '#4A5565',
    textMuted: '#6B7280',
    textDisabled: '#99A1AF',

    // semantic
    success: '#16A34A',
    successSoft: '#DCFCE7',
    warning: '#F59E0B',
    warningSoft: '#FEF3C7',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    info: '#2A8DFF',
    infoSoft: '#DBEAFE',

    // landing card tints
    card01: '#D5F5E8',
    card02: '#DCE9F9',
    card03: '#E4DEF7',
    card04: '#FBE3D2',

    // disabled
    disabled: '#C2C2C2'
  },

  gradients: {
    brand: 'linear-gradient(90deg, #05DF72 0%, #2A8DFF 100%)',
    brandSoft: 'linear-gradient(135deg, rgba(5,223,114,0.12) 0%, rgba(42,141,255,0.12) 100%)',
    logoBox: 'linear-gradient(180deg, #00A63E 0%, #155DFC 100%)',
    pageBg: 'linear-gradient(135deg, #E8FBEF 0%, #FFFFFF 35%, #E5EEFB 100%)',
    statCard: 'linear-gradient(135deg, #E8FBEF 0%, #E5EEFB 100%)'
  },

  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    pill: '999px'
  },

  shadows: {
    xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
    sm: '0 2px 6px rgba(15, 23, 42, 0.05)',
    md: '0 8px 24px rgba(27, 58, 107, 0.06)',
    lg: '0 12px 32px rgba(27, 58, 107, 0.08)'
  },

  fonts: {
    body: "'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },

  breakpoints: {
    mobile: '640px',
    tablet: '900px',
    desktop: '1200px'
  }
}

export const media = {
  mobile: `@media (max-width: ${theme.breakpoints.mobile})`,
  tablet: `@media (max-width: ${theme.breakpoints.tablet})`,
  desktop: `@media (max-width: ${theme.breakpoints.desktop})`
}
