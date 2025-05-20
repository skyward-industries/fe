import Head from "next/head";
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
      <Head>
        <title>Skyward Parts</title>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-939P68W607"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-939P68W607');
            `,
          }}
        />
      </Head>
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
            <main style={{ flex: 1, overflowY: "hidden" }}>{children}</main>
            <Footer />
          </SelectionProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
