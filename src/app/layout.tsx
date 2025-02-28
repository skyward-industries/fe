import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import MuiThemeProvider from "@/providers/ThemeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MuiThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </MuiThemeProvider>
      </body>
    </html>
  );
}