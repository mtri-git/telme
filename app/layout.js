// import localFont from "next/font/local";
import { SocketProvider } from "@/context/socketContext";
import "./globals.css";
import ThemeToggle from "@/components/base/themeToggle";
import { Toaster } from "react-hot-toast";
import AuthLayout from "@/components/layout/AuthLayout";
import { AuthProvider } from "@/context/authContext";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white relative"
      >
        <Toaster />
        <div className="fixed top-2 right-4 z-50">
          <ThemeToggle />
        </div>
        <div />
        <AuthProvider>
          <AuthLayout>
            <SocketProvider>{children}</SocketProvider>
          </AuthLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
