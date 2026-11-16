import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  typography: {
    fontSize: 15.5,
    fontFamily: '"Source Sans 3 Variable", sans-serif',
    h1: { fontFamily: '"Lora Variable", serif' },
    h2: { fontFamily: '"Lora Variable", serif' },
    h3: { fontFamily: '"Lora Variable", serif' },
    h4: { fontFamily: '"Lora Variable", serif' },
    h5: { fontFamily: '"Lora Variable", serif' },
    h6: { fontFamily: '"Lora Variable", serif' },
  },
  palette: {
    primary: {
      main: '#176B87',
    },
    secondary: {
      main: '#E07A5F',
    },
    background: {
      default: '#F7F8F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2933',
      secondary: '#667085',
    },
    divider: '#D9E1E5',
    success: {
      main: '#2E7D5B',
    },
    error: {
      main: '#C94C4C',
    },
  },
  shape: {
    borderRadius: 8,
  },
})