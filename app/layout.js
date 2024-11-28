// import localFont from "next/font/local";
import "./globals.css";
import ThemeToggle from "@/components/base/themeToggle";

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
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div />
        {children}
      </body>
    </html>
  );
}
