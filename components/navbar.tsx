"use client";

import { useState, useTransition, useEffect } from "react";
import { Menu, X, Globe, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { menuService, type MenuItem } from "@/lib/services";

// Nav links will be translated in the component
const defaultNavLinks = [
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


export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations('Navbar');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dynamicLinks, setDynamicLinks] = useState<MenuItem[]>(defaultNavLinks as MenuItem[]);

  const { totalItems } = useCart();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    menuService.getMenu('main-menu', locale)
      .then((data: any) => {
        console.log('Main menu data received:', data);
        const items = data?.items || data?.data?.items;
        if (items?.length > 0) {
          setDynamicLinks(items);
        }
      })
      .catch((err: Error) => console.log('Menu fetch failed:', err.message));
  }, [locale]);

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
    <nav className="sticky top-0 z-50 bg-white border-b border-[var(--gray-mid)]">
      <div className="max-w-7xl mx-auto px-[5%] flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="POLO SIM - One Sim One World"
            width={360}
            height={120}
            className="h-14 sm:h-16 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {dynamicLinks.map((link, idx) => {
            const title = link.key ? t(link.key as any) : link.title;
            const isExternal = link.external || link.target === "_blank";

            if (link.children && link.children.length > 0) {
              return (
                <div 
                  key={idx} 
                  className="relative group h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown(`desktop-${idx}`)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-[var(--text-dark)] hover:text-[var(--gold)] transition-colors text-sm font-medium cursor-default py-2">
                    {title}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {activeDropdown === `desktop-${idx}` && (
                    <div className="absolute top-10 left-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-xl overflow-hidden z-50 min-w-[200px] shadow-lg py-2">
                      {link.children.map((child: any, cidx: number) => (
                        <Link
                          key={cidx}
                          href={child.url || child.href || '#'}
                          className="block px-4 py-2 text-sm text-[var(--text-dark)] hover:bg-[var(--gray-bg)] hover:text-[var(--gold)] transition-colors"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return isExternal ? (
              <a
                key={idx}
                href={link.url || link.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-dark)] hover:text-[var(--gold)] transition-colors text-sm font-medium"
              >
                {title}
              </a>
            ) : (
              <Link
                key={idx}
                href={link.url || link.href || '#'}
                className="text-[var(--text-dark)] hover:text-[var(--gold)] transition-colors text-sm font-medium"
              >
                {title}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              onBlur={() => setTimeout(() => setLangMenuOpen(false), 150)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--gray-text)] hover:text-[var(--text-dark)] transition-colors"
              disabled={isPending}
            >
              🌐 {locale.toUpperCase()}
            </button>
            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-xl overflow-hidden z-50 min-w-[130px] shadow-md">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--gray-bg)] transition-colors ${locale === lang.code ? "text-[var(--gold)] font-semibold" : "text-[var(--text-dark)]"
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
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-dark)] hover:text-[var(--gold)] transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--gold)] text-white text-xs flex items-center justify-center font-medium">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-[var(--gray-mid)] animate-pulse" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-dark)] hover:text-[var(--gold)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--gold-pale)] border border-[var(--gold)]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--gold)]" />
                </div>
                <span className="hidden lg:inline">{user?.name?.split(" ")[0]}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-xl overflow-hidden z-50 min-w-[180px] shadow-md">
                  <div className="px-4 py-3 border-b border-[var(--gray-mid)]">
                    <p className="text-sm font-medium text-[var(--text-dark)]">{user?.name}</p>
                    <p className="text-xs text-[var(--gray-text)]">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--gray-bg)] transition-colors text-[var(--text-dark)]"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {t('myProfile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-[var(--gray-bg)] transition-colors text-red-500"
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
                <button className="px-5 py-2 border-[1.5px] border-[var(--text-dark)] rounded-xl bg-transparent font-['Sora'] font-semibold text-[13px] text-[var(--text-dark)] hover:bg-[var(--text-dark)] hover:text-white transition-all">
                  {t('login')}
                </button>
              </Link>
              <Link href="/get-started">
                <button className="px-5 py-2 border-none rounded-xl bg-[var(--gold)] font-['Sora'] font-bold text-[13px] text-white hover:bg-[var(--gold-light)] hover:translate-y-[-1px] transition-all">
                  {t('getStarted')}
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Cart & Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            className="relative p-2 rounded-lg hover:bg-[var(--gray-bg)] text-[var(--text-dark)]"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--gold)] text-white text-xs flex items-center justify-center font-medium">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
          <button
            className="p-2 rounded-lg hover:bg-[var(--gray-bg)] text-[var(--text-dark)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--gray-mid)] bg-white px-[5%] py-4">
          <div className="flex flex-col gap-2">
            {dynamicLinks.map((link, idx) => {
              const title = link.key ? t(link.key as any) : link.title;
              const isExternal = link.external || link.target === "_blank";

              if (link.children && link.children.length > 0) {
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === `mobile-${idx}` ? null : `mobile-${idx}`)}
                      className="flex items-center justify-between px-4 py-3 rounded-lg text-[var(--text-dark)] hover:text-[var(--gold)] hover:bg-[var(--gray-bg)] transition-colors font-medium"
                    >
                      {title}
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === `mobile-${idx}` ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === `mobile-${idx}` && (
                      <div className="flex flex-col gap-1 pl-4 border-l-2 border-[var(--gray-mid)] ml-4 mb-2">
                        {link.children.map((child: any, cidx: number) => (
                          <Link
                            key={cidx}
                            href={child.url || child.href || '#'}
                            className="px-4 py-2 rounded-lg text-sm text-[var(--text-dark)] hover:bg-[var(--gray-bg)] hover:text-[var(--gold)] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return isExternal ? (
                <a
                  key={idx}
                  href={link.url || link.href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-lg text-[var(--text-dark)] hover:text-[var(--gold)] hover:bg-[var(--gray-bg)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {title}
                </a>
              ) : (
                <Link
                  key={idx}
                  href={link.url || link.href || '#'}
                  className="px-4 py-3 rounded-lg text-[var(--text-dark)] hover:text-[var(--gold)] hover:bg-[var(--gray-bg)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {title}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--gray-mid)]">

              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-2 px-4 py-2">
                <Globe className="w-4 h-4 text-[var(--gray-text)]" />
                <span className="text-sm text-[var(--gray-text)]">Language:</span>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${locale === lang.code
                        ? "bg-[var(--gold)] text-white"
                        : "bg-[var(--gray-bg)] text-[var(--gray-text)]"
                      }`}
                  >
                    {lang.code}
                  </button>
                ))}
              </div>
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-[var(--text-dark)]">
                      <User className="w-4 h-4 mr-2" />
                      {t('myProfile')}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500"
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
                    <button className="w-full px-5 py-2.5 border-[1.5px] border-[var(--text-dark)] rounded-xl bg-transparent font-['Sora'] font-semibold text-[13px] text-[var(--text-dark)] hover:bg-[var(--text-dark)] hover:text-white transition-all">
                      {t('login')}
                    </button>
                  </Link>
                  <Link href="/get-started" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-5 py-2.5 border-none rounded-xl bg-[var(--gold)] font-['Sora'] font-bold text-[13px] text-white hover:bg-[var(--gold-light)] transition-all">
                      {t('getStarted')}
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
