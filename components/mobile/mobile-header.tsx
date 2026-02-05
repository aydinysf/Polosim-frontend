"use client";

import { Bell, Globe } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const languages = [
  { code: "EN", label: "English" },
  { code: "TR", label: "Turkce" },
];

export function MobileHeader() {
  const [currentLang, setCurrentLang] = useState("EN");
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <a href="/mobile" className="flex items-center">
          <Image
            src="/logo.png"
            alt="POLO SIM"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </a>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {currentLang}
            </button>
            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg overflow-hidden z-50 min-w-[100px] shadow-lg">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-secondary/50 transition-colors ${
                      currentLang === lang.code ? "text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    {lang.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          {/* Profile */}
          <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            PS
          </button>
        </div>
      </div>
    </header>
  );
}
