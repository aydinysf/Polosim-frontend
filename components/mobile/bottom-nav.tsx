"use client";

import { Home, Globe2, ShoppingBag, User } from "lucide-react";
import { usePathname, Link } from "@/i18n/routing";

const navItems = [
  { id: "home", label: "Home", icon: Home, href: "/mobile" },
  { id: "explore", label: "Explore", icon: Globe2, href: "/mobile/explore" },
  { id: "orders", label: "Orders", icon: ShoppingBag, href: "/mobile/orders" },
  { id: "profile", label: "Profile", icon: User, href: "/mobile/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  const getActiveState = (href: string) => {
    if (href === "/mobile") return pathname === "/mobile";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50">
      <div className="flex items-center justify-around py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = getActiveState(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${
                isActive ? "bg-primary/10" : ""
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
