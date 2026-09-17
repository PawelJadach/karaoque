import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { LanguageSwitch } from "../components/LanguageSwitch";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Karaoque",
  description: "Wspólna lista piosenek na karaoke",
  appleWebApp: {
    capable: true,
    title: "Karaoque",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#120814",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>
          <div className="flex justify-end px-3 pt-3">
            <LanguageSwitch />
          </div>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
