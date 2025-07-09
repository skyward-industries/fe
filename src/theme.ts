// src/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { grey, blue, green, red } from '@mui/material/colors';

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#2c3e50', // Darker, more sophisticated slate blue
      light: '#4a6c85',
      dark: '#1a252f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3498db', // Modern bright blue for accents
      light: '#5dade2',
      dark: '#2980b9',
      contrastText: '#ffffff',
    },
    error: {
      main: '#e74c3c', // Crisp red for error/important actions
    },
    success: {
      main: '#27ae60', // Fresh green for success messages
    },
    info: {
      main: '#3498db', // Consistent blue for informational messages
    },
    warning: {
      main: '#f39c12', // Vibrant orange for warnings
    },
    background: {
      default: '#f8f9fa', // Very light grey with slight warmth
      paper: '#ffffff', // Pure white for cards and elements
    },
    text: {
      primary: '#2c3e50', // Dark blue-grey for main text (matches primary)
      secondary: '#7f8c8d', // Sophisticated grey for subtle text
    },
  },
  typography: {
    fontFamily: ['"Inter"', '"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['"Inter"', 'sans-serif'].join(','),
      fontSize: '3.5rem',
      fontWeight: 800,
      color: '#2c3e50',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: ['"Inter"', 'sans-serif'].join(','),
      fontSize: '2.75rem',
      fontWeight: 700,
      color: '#2c3e50',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: ['"Inter"', 'sans-serif'].join(','),
      fontSize: '2.25rem',
      fontWeight: 600,
      color: '#2c3e50',
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: ['"Inter"', 'sans-serif'].join(','),
      fontSize: '1.875rem',
      fontWeight: 600,
      color: '#2c3e50',
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: ['"Inter"', 'sans-serif'].join(','),
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#2c3e50',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: ['"Inter"', 'sans-serif'].join(','),
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#2c3e50',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2c3e50',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#7f8c8d',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2c3e50',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '72px',
          '@media (max-width:600px)': {
            minHeight: '64px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          padding: '12px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2980b9 0%, #21618c 100%)',
            boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
          boxShadow: '0 4px 15px rgba(155, 89, 182, 0.3)',
        },
        outlinedPrimary: {
          borderColor: '#3498db',
          color: '#3498db',
          borderWidth: '2px',
          '&:hover': {
            backgroundColor: 'rgba(52, 152, 219, 0.05)',
            borderColor: '#2980b9',
            borderWidth: '2px',
          },
        },
        containedError: {
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #c0392b 0%, #a93226 100%)',
            boxShadow: '0 6px 20px rgba(231, 76, 60, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '&:hover fieldset': {
              borderColor: '#3498db',
            },
            '&.Mui-focused': {
              '& fieldset': {
                borderColor: '#3498db',
                borderWidth: '2px',
              },
              boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)',
            },
          },
          '& .MuiInputBase-input': {
            padding: '14px 16px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: 'rgba(0,0,0,0.08)',
          borderRadius: '16px',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          '&:before': {
            display: 'none',
          },
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 6px 12px rgba(0, 0, 0, 0.1)',
    '0px 8px 16px rgba(0, 0, 0, 0.12)',
    '0px 12px 24px rgba(0, 0, 0, 0.14)',
    '0px 16px 32px rgba(0, 0, 0, 0.16)',
    '0px 20px 40px rgba(0, 0, 0, 0.18)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
  ],
};

const theme = createTheme(themeOptions);

export default theme;