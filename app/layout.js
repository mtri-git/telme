import localFont from "next/font/local";
import { SocketProvider } from "@/context/socketContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthLayout from "@/components/layout/AuthLayout";
import { AuthProvider } from "@/context/authContext";
import PWAInstallPrompt from "@/components/base/PWAInstallPrompt";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata = {
  title: "Telme",
  description: "Chat app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Telme",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Telme",
    "msapplication-TileColor": "#1f2937",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

// Apply the saved (or system) theme before first paint to avoid a light-mode flash
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background text-foreground antialiased relative`}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            className: "!bg-card !text-card-foreground !border !border-border !shadow-lg text-sm",
          }}
        />
        <AuthProvider>
          <AuthLayout>
            <SocketProvider>{children}</SocketProvider>
          </AuthLayout>
        </AuthProvider>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
