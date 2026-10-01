"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SplashScreen from "@/components/layout/SplashScreen";

export default function MainLayout({
  children
}: {
    children: React.ReactNode
  }) {
  const [splashFinished, setSplashFinished] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      
      {!splashFinished && (
        <SplashScreen onComplete={() => setSplashFinished(true)} />
      )}

      <div 
        className={`flex flex-1 flex-col transition-opacity duration-700 ${
          splashFinished ? "opacity-100" : "h-screen overflow-hidden opacity-0"
        }`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}