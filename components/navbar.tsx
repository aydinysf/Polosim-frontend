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
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

const MAIN_MENU_HANDLE = "header";

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

  const resolveMenuTitle = (link: MenuItem & { href?: string }) => {
    const apiTitle = typeof link.title === "string" ? link.title.trim() : "";
    if (apiTitle) return apiTitle;
    return link.key ? t(link.key as any) : "";
  };

  useEffect(() => {
    menuService.getMenu(MAIN_MENU_HANDLE, locale)
      .then((data: any) => {
        const items = data?.items || data?.data?.items;
        if (items?.length > 0) {
          setDynamicLinks(items);
        }
      })
      .catch(() => {});
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
    <nav className="fixed top-0 left-0 right-0 z-50 pt-4 px-[5%] pointer-events-none">
      <div className="max-w-[1300px] mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-between h-[140px] px-8 pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="POLO SIM - One Sim One World"
            width={480}
            height={150}
            className="h-[120px] sm:h-[144px] w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-5">
          {dynamicLinks.map((link, idx) => {
            const title = resolveMenuTitle(link);
            const isExternal = link.external || link.target === "_blank";

            if (link.children && link.children.length > 0) {
              return (
                <div 
                  key={idx} 
                  className="relative group h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown(`desktop-${idx}`)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-[#1A2332] hover:text-[var(--gold)] transition-colors text-[13px] font-semibold cursor-default py-2">
                    {title}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {activeDropdown === `desktop-${idx}` && (
                    <div className="absolute top-[80%] left-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-xl overflow-hidden z-50 min-w-[200px] shadow-lg py-2">
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
                className="text-[#1A2332] hover:text-[var(--gold)] transition-colors text-[13px] font-semibold whitespace-nowrap"
              >
                {title}
              </a>
            ) : (
              <Link
                key={idx}
                href={link.url || link.href || '#'}
                className="text-[#1A2332] hover:text-[var(--gold)] transition-colors text-[13px] font-semibold whitespace-nowrap"
              >
                {title}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[#1A2332] hover:text-[var(--gold)] transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--gold)] text-white text-[10px] flex items-center justify-center font-semibold">
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
                <span className="hidden xl:inline">{user?.name?.split(" ")[0]}</span>
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
              <button
                onClick={() => router.push("/get-started")}
                className="px-5 py-2 border-none rounded-lg bg-[var(--gold)] font-semibold text-[13px] text-white hover:bg-[var(--gold-light)] transition-all whitespace-nowrap"
              >
                Hesap Aç
              </button>
              <button
                onClick={() => router.push("/sign-in")}
                className="px-5 py-2 border border-[var(--gray-mid)] rounded-lg bg-white font-semibold text-[13px] text-[var(--text-dark)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all whitespace-nowrap"
              >
                Giriş Yap
              </button>
            </>
          )}

          {/* Language Switcher */}
          <div className="relative ml-1">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1A2332] hover:text-[var(--gold)] transition-colors px-2 py-1.5 rounded-lg hover:bg-[var(--gray-bg)]"
              disabled={isPending}
            >
              <span>{locale === 'tr' ? '🇹🇷' : '🇬🇧'}</span>
              <span>{locale.toUpperCase()}</span>
            </button>
            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-xl overflow-hidden z-50 min-w-[130px] shadow-lg pointer-events-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--gray-bg)] transition-colors flex items-center gap-2 ${locale === lang.code ? "text-[var(--gold)] font-semibold" : "text-[var(--text-dark)]"
                      }`}
                  >
                    <span>{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart & Menu */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/cart"
            className="relative p-2 rounded-lg hover:bg-[var(--gray-bg)] text-[var(--text-dark)]"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--gold)] text-white text-[10px] flex items-center justify-center font-semibold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
          <button
            className="p-2 rounded-lg hover:bg-[var(--gray-bg)] text-[var(--text-dark)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-auto max-w-[1300px] bg-white rounded-xl shadow-lg px-5 py-4 pointer-events-auto">
          <div className="flex flex-col gap-2">
            {dynamicLinks.map((link, idx) => {
              const title = resolveMenuTitle(link);
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
                <span className="text-sm text-[var(--gray-text)]">Dil:</span>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${locale === lang.code
                        ? "bg-[var(--gold)] text-white"
                        : "bg-[var(--gray-bg)] text-[var(--gray-text)]"
                      }`}
                  >
                    <span>{lang.flag}</span>
                    {lang.code.toUpperCase()}
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
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      router.push("/get-started");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 px-5 py-2.5 border-none rounded-lg bg-[var(--gold)] font-semibold text-[13px] text-white hover:bg-[var(--gold-light)] transition-all"
                  >
                    Hesap Aç
                  </button>
                  <button
                    onClick={() => {
                      router.push("/sign-in");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 px-5 py-2.5 border border-[var(--gray-mid)] rounded-lg bg-white font-semibold text-[13px] text-[var(--text-dark)] hover:border-[var(--gold)] transition-all"
                  >
                    Giriş Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
