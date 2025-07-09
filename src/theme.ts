// src/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { grey, blue, green, red } from '@mui/material/colors';

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#1e3a5f', // Deep aerospace blue
      light: '#4a90a4',
      dark: '#0f1c2e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2c5f7f', // Professional steel blue
      light: '#5a8dad',
      dark: '#1a3d52',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    info: {
      main: '#0277bd',
      light: '#03a9f4',
      dark: '#01579b',
    },
    background: {
      default: '#f8fafc', // Cleaner off-white
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    // Custom colors for enhanced design
    mode: 'light',
  },
  typography: {
    fontFamily: ['"Inter"', '"Roboto"', '"Helvetica"', 'Arial', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['"Poppins"', '"Montserrat"', 'sans-serif'].join(','),
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 700,
      color: '#1a202c',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: ['"Poppins"', '"Montserrat"', 'sans-serif'].join(','),
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      fontWeight: 600,
      color: '#1a202c',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: ['"Poppins"', '"Montserrat"', 'sans-serif'].join(','),
      fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
      fontWeight: 600,
      color: '#1a202c',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: ['"Poppins"', '"Montserrat"', 'sans-serif'].join(','),
      fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
      fontWeight: 600,
      color: '#1e3a5f',
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: ['"Poppins"', '"Montserrat"', 'sans-serif'].join(','),
      fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
      fontWeight: 500,
      color: '#1e3a5f',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: ['"Poppins"', '"Montserrat"', 'sans-serif'].join(','),
      fontSize: '1.1rem',
      fontWeight: 500,
      color: '#2c5f7f',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      color: '#4a5568',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#4a5568',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.95rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#718096',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.05)',
    '0px 4px 6px rgba(0, 0, 0, 0.07)',
    '0px 5px 15px rgba(0, 0, 0, 0.08)',
    '0px 10px 24px rgba(0, 0, 0, 0.1)',
    '0px 15px 35px rgba(0, 0, 0, 0.12)',
    '0px 20px 40px rgba(0, 0, 0, 0.14)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px rgba(0, 0, 0, 0.16)',
  ],
};

const theme = createTheme(themeOptions);

export default theme;