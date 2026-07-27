/** Mirror of tokens.css for R3F / JS usage */

export const tokens = {
  rdBlue: '#0033A0',
  rdBlueDark: '#001F66',
  rdRed: '#D5162C',
  rdRedDark: '#9E0E20',
  rdWhite: '#FFFFFF',
  uiNavy: '#0B1F3A',
  uiNavyGlass: 'rgba(11, 31, 58, 0.86)',
  uiNavyLight: '#142C52',
  uiGold: '#F5C542',
  uiGoldDark: '#B8892A',
  uiGoldBright: '#FFE07A',
  btnRed: '#E6303F',
  btnRedDark: '#A81E2A',
  btnBlue: '#1D63C7',
  btnBlueDark: '#0F3E86',
  btnGreen: '#2FAE47',
  btnGreenDark: '#1B7A2E',
  bananaYellow: '#FFD23F',
  coinGold: '#FFCC4D',
  picaPolloRed: '#C1272D',
  picaPolloWhite: '#F7ECD9',
  successGreen: '#34C759',
  dangerRed: '#FF3B30',
  highlightGreen: '#3FDB6B',
  asphalt: '#3A3A3A',
  dirt: '#8B5A2B',
  skyTop: '#4AA3FF',
  skyBottom: '#A8D8FF',
} as const;

export type Tokens = typeof tokens;
