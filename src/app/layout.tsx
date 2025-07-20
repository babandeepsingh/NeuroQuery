import type { Metadata } from "next";
import {
  ClerkProvider,
  SignIn,
  SignInButton,
  SignUp,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroQuery",
  description: "From Natural Language to SQL, Intelligently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen`}
        >

          <SignedOut>
            <div className="h-full flex items-center justify-center">
              <SignIn routing="hash" />
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex justify-end container mx-auto px-4 py-4">
              <UserButton />
            </div>
            <main>
              {children}
            </main>
          </SignedIn>
          {/*  */}
        </body>
      </html>
    </ClerkProvider>
  );
}
