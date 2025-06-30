// import localFont from "next/font/local";
import { SocketProvider } from "@/context/socketContext";
import "./globals.css";
import ThemeToggle from "@/components/base/themeToggle";
import { Toaster } from "react-hot-toast";
import AuthLayout from "@/components/layout/AuthLayout";
import { AuthProvider } from "@/context/authContext";
import PWAInstallPrompt from "@/components/base/PWAInstallPrompt";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata = {
  title: "Telme",
  description: "Chat app",
  manifest: "/manifest.json",
  themeColor: "#1f2937",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground relative">
        <Toaster />
        <div className="fixed top-2 right-4 z-50">
          <ThemeToggle />
        </div>
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
