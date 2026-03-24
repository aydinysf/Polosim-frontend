"use client";

import { useState, useTransition } from "react";
import { Menu, X, Globe, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

// Nav links will be translated in the component
const navLinks = [
  { key: "destinations", href: "/#destinations" },
  { key: "plans", href: "/plans" },
  { key: "howItWorks", href: "/how-it-works" },
  { key: "support", href: "/support" },
  { key: "bayi-girisi", href: "https://panel.polosim.com/", external: true },
];

const languages = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
];

const currencies = [
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "TRY", symbol: "₺", label: "Turkish Lira" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations('Navbar');
  const [currentCurrency, setCurrentCurrency] = useState("EUR");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
    setLangMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-2">
        <div className="max-w-7xl mx-auto px-6 py-2 rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="POLO SIM - One Sim One World"
                width={360}
                height={120}
                className="h-14 sm:h-20 md:h-32 w-auto scale-150 origin-left"
                priority
              />
            </Link>

            {/* Right side container */}
            <div className="hidden md:flex items-center gap-6">
              {/* Desktop Navigation */}
              <div className="flex items-center gap-6">
                {navLinks.map((link) =>
                  link.external ? (
                    <a
                      key={link.key}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm font-bold"
                    >
                      {t(link.key)}
                    </a>
                  ) : (
                    <Link
                      key={link.key}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm font-bold"
                    >
                      {t(link.key)}
                    </Link>
                  )
                )}
              </div>

              {/* Desktop CTA */}
              <div className="flex items-center gap-3">
                {/* Currency Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
                    onBlur={() => setTimeout(() => setCurrencyMenuOpen(false), 150)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-semibold">{currencies.find(c => c.code === currentCurrency)?.symbol}</span>
                    {currentCurrency}
                  </button>
                  {currencyMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 min-w-[140px]">
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setCurrentCurrency(currency.code);
                            setCurrencyMenuOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-secondary/50 transition-colors ${currentCurrency === currency.code ? "text-primary font-medium" : "text-foreground"
                            }`}
                        >
                          {currency.symbol} {currency.code} - {currency.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Language Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    onBlur={() => setTimeout(() => setLangMenuOpen(false), 150)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    disabled={isPending}
                  >
                    <Globe className="w-4 h-4" />
                    {locale.toUpperCase()}
                  </button>
                  {langMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 min-w-[120px]">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-secondary/50 transition-colors ${locale === lang.code ? "text-primary font-medium" : "text-foreground"
                            }`}
                        >
                          {lang.code.toUpperCase()} - {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Cart Icon */}
                <Link
                  href="/cart"
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </Link>
                {isLoading ? (
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                ) : isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="hidden lg:inline">{user?.name?.split(" ")[0]}</span>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 min-w-[180px]">
                        <div className="px-4 py-3 border-b border-border/50">
                          <p className="text-sm font-medium text-foreground">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors text-foreground"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          {t('myProfile')}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors text-destructive"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/sign-in">
                      <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        {t('login')}
                      </Button>
                    </Link>
                    <Link href="/get-started">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {t('getStarted')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Cart & Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/cart"
                className="relative p-2 rounded-lg hover:bg-secondary/50 text-foreground"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
              <button
                className="p-2 rounded-lg hover:bg-secondary/50 text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-border/50">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) =>
                  link.external ? (
                    <a
                      key={link.key}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t(link.key)}
                    </a>
                  ) : (
                    <Link
                      key={link.key}
                      href={link.href}
                      className="px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t(link.key)}
                    </Link>
                  )
                )}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                  {/* Mobile Currency Switcher */}
                  <div className="flex items-center gap-2 px-4 py-2">
                    <span className="text-sm text-muted-foreground">Currency:</span>
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => setCurrentCurrency(currency.code)}
                        className={`px-3 py-1 rounded-md text-sm ${currentCurrency === currency.code
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground"
                          }`}
                      >
                        {currency.symbol} {currency.code}
                      </button>
                    ))}
                  </div>
                  {/* Mobile Language Switcher */}
                  <div className="flex items-center gap-2 px-4 py-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Language:</span>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          handleLanguageChange(lang.code);
                          setMobileMenuOpen(false);
                        }}
                        className={`px-3 py-1 rounded-md text-sm ${locale === lang.code
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground"
                          }`}
                      >
                        {lang.code}
                      </button>
                    ))}
                  </div>
                  {isAuthenticated ? (
                    <>
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                          <User className="w-4 h-4 mr-2" />
                          {t('myProfile')}
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('logout')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                          {t('login')}
                        </Button>
                      </Link>
                      <Link href="/get-started" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
