import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import MuiThemeProvider from "@/providers/ThemeProvider";
import { SelectionProvider } from "@/context/SelectionContext";
import "@/styles/global.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <MuiThemeProvider>
          <SelectionProvider>
            <Navbar />
            <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
            <Footer />
          </SelectionProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
