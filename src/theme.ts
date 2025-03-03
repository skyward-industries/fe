import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    button: {
      fontWeight: 700, // Makes all buttons bold
      textTransform: "none", // Optional: keeps text case as written
    },
  },
});

export default theme;
