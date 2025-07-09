// src/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { grey, blue, green, red } from '@mui/material/colors';

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#34495e', // Dark slate grey for AppBar and main dark elements
      light: '#5c7c9e',
      dark: '#1f2e3d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#607d8b', // A slightly muted blue-grey for secondary elements
      light: '#8eacbb',
      dark: '#345163',
      contrastText: '#ffffff',
    },
    error: {
      main: red[500], // Standard red for error/important actions
    },
    success: {
      main: green[500], // For success messages/actions
    },
    info: {
      main: blue[500], // For informational messages
    },
    background: {
      default: grey[50], // Very light grey for general background
      paper: '#ffffff', // Pure white for cards and elements
    },
    text: {
      primary: grey[900], // Dark grey for main text
      secondary: grey[700], // Lighter grey for subtle text
    },
  },
  typography: {
    fontFamily: ['"Lato"', 'Arial', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['"Montserrat"', 'sans-serif'].join(','),
      fontSize: '3rem',
      fontWeight: 700,
      color: grey[900],
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: ['"Montserrat"', 'sans-serif'].join(','),
      fontSize: '2.5rem',
      fontWeight: 700,
      color: grey[900],
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: ['"Montserrat"', 'sans-serif'].join(','),
      fontSize: '2rem',
      fontWeight: 600,
      color: grey[900],
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: ['"Montserrat"', 'sans-serif'].join(','),
      fontSize: '1.7rem',
      fontWeight: 600,
      color: grey[900],
      lineHeight: 1.2,
    },
    h5: {
      fontFamily: ['"Montserrat"', 'sans-serif'].join(','),
      fontSize: '1.4rem',
      fontWeight: 500,
      color: grey[900],
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 700,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // Remove default AppBar shadow for a cleaner look
          padding: '0.5rem 0', // Consistent padding
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px', // Ensure consistent height
          '@media (max-width:600px)': {
            minHeight: '56px', // Standard mobile app bar height
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Slightly more rounded buttons
          textTransform: 'none', // Keep button text as is (not all caps)
          padding: '8px 16px', // Standard padding for buttons
        },
        containedPrimary: {
          backgroundColor: '#007bff', // Your "traditional" blue for contained primary buttons
          '&:hover': {
            backgroundColor: '#0056b3',
          },
        },
        outlinedPrimary: {
          borderColor: '#007bff', // Match border color
          color: '#007bff', // Match text color
          '&:hover': {
            backgroundColor: 'rgba(0, 123, 255, 0.04)', // Light hover background
            borderColor: '#0056b3',
          },
        },
        containedError: { // For Create RFQ button
          backgroundColor: red[600],
          '&:hover': {
            backgroundColor: red[700],
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // Match button radius
            backgroundColor: grey[100], // Light background for text fields
            '&.Mui-focused fieldset': {
              borderColor: '#007bff', // Primary color border on focus
            },
          },
          '& .MuiInputBase-input': {
            padding: '10px 14px', // Adjust padding for a cleaner look
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // More prominent rounded corners for cards
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', // Softer, larger shadow
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)', // Subtle lift on hover
          },
        },
      },
    },
    MuiContainer: {
        defaultProps: {
            maxWidth: 'lg', // Default container size for most content
        },
    },
  },
   breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900, // Common tablet breakpoint
      lg: 1200, // Common desktop breakpoint
      xl: 1536,
    },
  },
}; // ← this closes `themeOptions`

const theme = createTheme(themeOptions);

export default theme;