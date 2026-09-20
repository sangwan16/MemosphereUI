import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
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