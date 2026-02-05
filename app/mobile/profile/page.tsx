"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Globe,
  Moon,
  Smartphone,
} from "lucide-react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const menuSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal Information", href: "#" },
      { icon: Mail, label: "Email Settings", href: "#" },
      { icon: Phone, label: "Phone Number", href: "#", badge: "Verify" },
      { icon: CreditCard, label: "Payment Methods", href: "#" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Globe, label: "Language", href: "#", value: "English" },
      { icon: Bell, label: "Notifications", href: "#", toggle: true },
      { icon: Moon, label: "Dark Mode", href: "#", toggle: true, enabled: false },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: Smartphone, label: "Compatible Devices", href: "#" },
      { icon: HelpCircle, label: "Help Center", href: "#" },
      { icon: FileText, label: "Terms & Conditions", href: "#" },
      { icon: Shield, label: "Privacy Policy", href: "#" },
    ],
  },
];

const stats = [
  { label: "Total Orders", value: "12" },
  { label: "Countries Visited", value: "8" },
  { label: "Data Used", value: "45GB" },
];

export default function ProfilePage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const isLoggedIn = true; // Simulated login state

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <main className="pt-16 pb-24">
        {/* Profile Header */}
        <div className="px-4 py-6">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">John Doe</h1>
                <p className="text-sm text-muted-foreground">john.doe@email.com</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-500">Verified Account</span>
                </div>
              </div>
              <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-foreground mb-2">Welcome to POLO SIM</h2>
              <p className="text-sm text-muted-foreground mb-4">Sign in to manage your eSIMs</p>
              <Button className="w-full bg-primary text-primary-foreground">
                Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        {isLoggedIn && (
          <div className="px-4 mb-6">
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card/50 border border-border/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral Banner */}
        {isLoggedIn && (
          <div className="px-4 mb-6">
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Invite Friends</h3>
                  <p className="text-xs text-muted-foreground mt-1">Get $5 credit for each referral</p>
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground text-xs">
                  Share
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Sections */}
        <div className="px-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {section.title}
              </h3>
              <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
                {section.items.map((item, index) => (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors ${
                      index !== section.items.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-sm text-foreground text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {item.badge}
                      </span>
                    )}
                    {item.value && (
                      <span className="text-xs text-muted-foreground">{item.value}</span>
                    )}
                    {item.toggle !== undefined ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.label === "Notifications") setNotifications(!notifications);
                          if (item.label === "Dark Mode") setDarkMode(!darkMode);
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          (item.label === "Notifications" ? notifications : darkMode)
                            ? "bg-primary"
                            : "bg-secondary"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            (item.label === "Notifications" ? notifications : darkMode)
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        {isLoggedIn && (
          <div className="px-4 mt-6">
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        )}

        {/* App Version */}
        <div className="text-center mt-8 mb-4">
          <Image
            src="/logo.png"
            alt="POLO SIM"
            width={100}
            height={32}
            className="h-8 w-auto mx-auto mb-2 opacity-50"
          />
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
