"use client";

import { useState, useEffect } from "react";
import {
  User, LogOut, Smartphone, Clock, CheckCircle,
  AlertCircle, ChevronRight, Signal, Calendar,
  RefreshCw, X, Wifi, Loader2, Copy, Check, Trash2, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/lib/services/authService";
import { walletService } from "@/lib/services/walletService";
import { esimProfileService, type EsimPackageData, type EsimUsageResponse } from "@/lib/services/esimProfileService";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { getFlagFromISO } from "@/lib/api-client";
import { useLocale, useTranslations } from "next-intl";

type PackageStatus = "all" | "active" | "upcoming" | "expired";

type EsimPackage = EsimPackageData & {
  // timeProgress computed locally
  timeProgress: number;
  validity: string;
  usedData: string;
  remainingData: string;
  usagePercentage: number;
  qrCodeUrl: string | null;
  expiresAt: string | null;
  activatedAt: string | null;
};

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const tc = useTranslations('GetStarted');
  const locale = useLocale();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PackageStatus>("all");
  const [selectedPackage, setSelectedPackage] = useState<EsimPackage | null>(null);
  const [packages, setPackages] = useState<EsimPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [usageDetails, setUsageDetails] = useState<EsimUsageResponse | null>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(false);
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState("10"); // Default 10 EUR

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPackages();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedPackage && selectedPackage.iccid && selectedPackage.status === "active") {
      fetchUsage(selectedPackage.iccid);
    } else {
      setUsageDetails(null);
    }
  }, [selectedPackage]);

  const fetchUsage = async (iccid: string) => {
    setIsUsageLoading(true);
    try {
      const usage = await esimProfileService.getEsimUsage(iccid);
      setUsageDetails(usage);
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    } finally {
      setIsUsageLoading(false);
    }
  };

  const loadPackages = async () => {
    setIsLoading(true);
    setError("");
    try {
      const esims = await esimProfileService.getMyEsims();

      const mapped: EsimPackage[] = esims.map((esim) => {
        const duration = esim.validityDays;
        const startDate = esim.startDate;

        // Süre ilerlemesi
        let timeProgress = 0;
        if (startDate && duration > 0 && esim.endDate) {
          const start = new Date(startDate).getTime();
          const end = new Date(esim.endDate).getTime();
          const now = Date.now();
          if (now >= start && now <= end) {
            timeProgress = ((now - start) / (end - start)) * 100;
          } else if (now > end) {
            timeProgress = 100;
          }
        }

        // Kalan data hesabı (plan varsa)
        const latestPlan = esim.plans?.[0];
        const totalBytes = latestPlan?.totalData || 0;
        const remainingBytes = latestPlan?.remainingData || 0;
        const usagePercentage = totalBytes > 0
          ? Math.round(((totalBytes - remainingBytes) / totalBytes) * 100)
          : 0;
        const toGB = (b: number) => b > 0 ? `${(b / 1024 / 1024 / 1024).toFixed(1)} GB` : "0 GB";

        return {
          ...esim,
          validity: duration > 0 ? `${duration} ${t('package.days')}` : "N/A",
          timeProgress: Math.min(100, Math.max(0, timeProgress)),
          usedData: totalBytes > 0 ? toGB(totalBytes - remainingBytes) : "0 GB",
          remainingData: totalBytes > 0 ? toGB(remainingBytes) : esim.data,
          usagePercentage,
          qrCodeUrl: null,
          expiresAt: esim.endDate,
          activatedAt: null,
        };
      });

      setPackages(mapped);
    } catch (err) {
      console.error("Failed to load packages:", err);
      setError(t('messages.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} ${t('messages.copied')}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authService.deactivateAccount();
      toast.success(t('messages.deactivated'));
      router.push("/");
    } catch (err) {
      toast.error(t('messages.deactivateError'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const refreshPackageStatus = async () => {
    await loadPackages();
  };

  const handleTopup = async () => {
    setIsTopupLoading(true);
    try {
      const amount = parseFloat(topupAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error(t('messages.invalidAmount'));
        return;
      }

      const response = await walletService.topup({
        amount: amount,
        currency: "EUR",
        provider: "paypal",
      });

      if (response.action === "redirect") {
        window.location.href = response.url;
      }
    } catch (err: any) {
      toast.error(err.message || t('messages.topupError'));
    } finally {
      setIsTopupLoading(false);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    if (activeTab === "all") return true;
    return pkg.status === activeTab;
  });

  const statusConfig = {
    active: { label: t('status.active'), color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    upcoming: { label: t('status.upcoming'), color: "bg-amber-50 text-amber-600 border-amber-200" },
    expired: { label: t('status.expired'), color: "bg-gray-50 text-gray-500 border-gray-200" },
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--gold)]" />
        <p className="text-[var(--gray-text)] font-bold uppercase tracking-widest text-[10px]">{t('messages.preparing')}</p>
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-[var(--navy)] pt-14 pb-12 px-[5%]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-[var(--gold)]/30 flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.1)]">
              <User className="w-10 h-10 text-[var(--gold)]" />
            </div>
            <div>
              <h1 className="text-[32px] font-extrabold text-white leading-tight font-['Sora'] tracking-tight">
                {user?.name || "User"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <p className="text-white/60 font-medium">{user?.email}</p>
                <span className="w-1 h-1 rounded-full bg-white/30 hidden sm:block" />
                <p className="text-xs text-[var(--gold)] font-bold uppercase tracking-widest">
                  {user?.created_at ? t('memberSince', { date: new Date(user.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { month: "long", year: "numeric" }) }) : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-2xl px-6 h-12 font-bold transition-all" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-red-500/40 text-red-500 hover:bg-red-500/10 hover:border-red-500 rounded-2xl px-6 h-12 font-bold transition-all"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('deleteAccount.button')}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 px-[5%]">
        <div className="max-w-6xl mx-auto">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border-[1.5px] border-[var(--gray-mid)] rounded-3xl p-6 shadow-sm hover:border-[var(--gold)]/50 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[var(--gray-bg)] flex items-center justify-center text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white transition-all">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-[var(--text-dark)] leading-none">{packages.length}</p>
                  <p className="text-[11px] text-[var(--gray-text)] font-bold uppercase tracking-wider mt-2">{t('stats.totalPackages')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border-[1.5px] border-[var(--gray-mid)] rounded-3xl p-6 shadow-sm hover:border-emerald-500/50 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-[var(--text-dark)] leading-none">
                    {packages.filter((p) => p.status === "active").length}
                  </p>
                  <p className="text-[11px] text-[var(--gray-text)] font-bold uppercase tracking-wider mt-2">{t('stats.activeUnits')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border-[1.5px] border-[var(--gray-mid)] rounded-3xl p-6 shadow-sm hover:border-blue-500/50 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Wifi className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-[var(--text-dark)] leading-none">
                    €{(user as any)?.wallet_balance || "0.00"}
                  </p>
                  <p className="text-[11px] text-[var(--gray-text)] font-bold uppercase tracking-wider mt-2">{t('stats.walletBalance')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Packages Section */}
          <div className="bg-[var(--gray-bg)] rounded-[40px] border-[1.5px] border-[var(--gray-mid)] p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-[28px] font-extrabold text-[var(--text-dark)] font-['Sora'] tracking-tight">{t('assets.title')}</h2>
                <p className="text-[var(--gray-text)] font-medium mt-1">{t('assets.subtitle')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-[1.5px] border-[var(--gray-mid)] hover:border-[var(--gold)] hover:text-[var(--gold)] rounded-xl px-5 h-11 font-bold transition-all"
                  onClick={refreshPackageStatus}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  {t('assets.refresh')}
                </Button>
                <Link href="/plans" className="no-underline">
                  <Button className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white border-none rounded-xl px-6 h-11 font-bold shadow-lg shadow-gold/20 transition-all">
                    {t('assets.buyNewPlan')}
                  </Button>
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm mb-8 flex items-center gap-3 font-semibold">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2.5 mb-10 overflow-x-auto pb-4 scrollbar-none">
              {(["all", "active", "upcoming", "expired"] as PackageStatus[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-7 py-3 rounded-2xl text-[13px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${activeTab === tab
                    ? "bg-[var(--gold)] text-white shadow-lg shadow-gold/20"
                    : "bg-white border-[1.5px] border-[var(--gray-mid)] text-[var(--gray-text)] hover:border-[var(--gold)]/50 hover:text-[var(--text-dark)]"
                    }`}
                >
                  {t(`tabs.${tab}`)}
                  <span className={`ml-3 px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${activeTab === tab ? "bg-white/20 text-white" : "bg-[var(--gray-bg)] text-[var(--gray-text)]"}`}>
                    {tab === "all" ? packages.length : packages.filter((p) => p.status === tab).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Package Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-[var(--gold)] mx-auto mb-4" />
                  <p className="text-[var(--gray-text)] font-bold uppercase tracking-widest text-[10px]">{t('messages.loading')}</p>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-[32px] border-[1.5px] border-[var(--gray-mid)] shadow-sm">
                  <Smartphone className="w-16 h-16 text-[var(--gray-text)]/20 mx-auto mb-6" />
                  <p className="text-xl font-bold text-[var(--text-dark)] font-['Sora']">{t('emptyState.title')}</p>
                  <p className="text-[var(--gray-text)] mt-2 max-w-xs mx-auto font-medium">{t('emptyState.description')}</p>
                  <Link href="/plans" className="mt-8 inline-block no-underline">
                    <Button className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white rounded-xl px-8 h-12 font-bold transition-all shadow-lg shadow-gold/20">
                      {t('emptyState.button')}
                    </Button>
                  </Link>
                </div>
              ) : (
                filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className="group relative flex flex-col p-7 rounded-[32px] bg-white border-[1.5px] border-[var(--gray-mid)] hover:border-[var(--gold)] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:translate-y-[-4px] overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        {pkg.flagUrl ? (
                          <div className="w-14 h-10 rounded-xl overflow-hidden border border-[var(--gray-mid)] shadow-sm flex-shrink-0">
                            <img
                              src={pkg.flagUrl}
                              alt={pkg.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-3xl">🌍</span>`;
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-4xl filter drop-shadow-md">🌍</span>
                        )}
                        <div>
                          <h3 className="font-extrabold text-[var(--text-dark)] leading-tight font-['Sora']">{pkg.name}</h3>
                          <Badge variant="outline" className={`mt-2 px-3 py-0.5 h-6 text-[9px] uppercase font-extrabold tracking-widest rounded-full ${statusConfig[pkg.status].color}`}>
                            {statusConfig[pkg.status].label}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[var(--gray-bg)] flex items-center justify-center text-[var(--gray-text)] group-hover:bg-[var(--gold)] group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--gray-text)] font-bold uppercase tracking-wider text-[10px]">{t('card.dataVolume')}</span>
                        <span className="font-extrabold text-[var(--text-dark)]">{pkg.data}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--gray-text)] font-bold uppercase tracking-wider text-[10px]">{t('card.validityPeriod')}</span>
                        <span className="font-extrabold text-[var(--text-dark)]">{pkg.validity}</span>
                      </div>

                      {/* Date Range */}
                      <div className="flex items-center gap-2 pt-4 border-t border-[var(--gray-mid)]">
                        <Calendar className="w-4 h-4 text-[var(--gold)]" />
                        <span className="text-xs text-[var(--gray-text)] font-bold uppercase tracking-[0.5px]">
                          {new Date(pkg.startDate).toLocaleDateString()} - {pkg.endDate ? new Date(pkg.endDate).toLocaleDateString() : "—"}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-4">
                        <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-widest text-[var(--gray-text)] mb-2">
                          <span>{t('card.timelineProgress')}</span>
                          <span className="text-[var(--gold)]">{Math.round(pkg.timeProgress)}%</span>
                        </div>
                        <div className="h-2.5 bg-[var(--gray-bg)] rounded-full overflow-hidden border border-[var(--gray-mid)]">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${pkg.status === 'active' ? 'bg-[var(--gold)] shadow-[0_0_10px_rgba(201,168,76,0.3)]' : 'bg-[var(--gray-text)]/30'}`}
                            style={{ width: `${pkg.timeProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--navy)]/80 backdrop-blur-md"
            onClick={() => setSelectedPackage(null)}
          />
          <div className="relative w-full max-w-xl bg-white border border-[var(--gray-mid)] rounded-[40px] shadow-2xl p-8 sm:p-12 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-[var(--gray-bg)] hover:bg-[var(--gold)] hover:text-white text-[var(--gray-text)] transition-all flex items-center justify-center border-none cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-6 mb-12">
              {selectedPackage.flagUrl ? (
                <div className="w-20 h-14 rounded-xl overflow-hidden border-2 border-[var(--gray-mid)] shadow-lg flex-shrink-0">
                  <img
                    src={selectedPackage.flagUrl}
                    alt={selectedPackage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-6xl">🌍</div>
              )}
              <div>
                <h2 className="text-[32px] font-extrabold text-[var(--text-dark)] tracking-tight font-['Sora'] leading-tight">{selectedPackage.name}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="outline" className={`px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full ${statusConfig[selectedPackage.status].color}`}>
                    {statusConfig[selectedPackage.status].label}
                  </Badge>
                  <span className="text-[11px] text-[var(--gray-text)] font-bold uppercase tracking-wider">{t('modal.order')} #{selectedPackage.orderId}</span>
                </div>
              </div>
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              {/* Visual Info - QR or Placeholder */}
              <div className="bg-[var(--gray-bg)] rounded-[32px] p-8 flex flex-col items-center justify-center text-center border border-[var(--gray-mid)] shadow-inner">
                {selectedPackage.status === "active" || selectedPackage.status === "upcoming" ? (
                  selectedPackage.qrCodeData ? (
                    <div className="p-4 bg-white rounded-3xl mb-6 shadow-xl border border-[var(--gray-mid)] transition-transform hover:scale-105">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedPackage.qrCodeData)}`}
                        alt="eSIM QR Code"
                        width={180}
                        height={180}
                        className="w-[180px] h-[180px]"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-3xl bg-amber-50 flex items-center justify-center mb-6">
                      <Clock className="w-16 h-16 text-amber-500 animate-pulse" />
                    </div>
                  )
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
                    <AlertCircle className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <h4 className="font-extrabold text-[var(--text-dark)] font-['Sora'] text-sm">{t('modal.activationInfo')}</h4>
                <p className="text-[11px] text-[var(--gray-text)] mt-2 font-medium max-w-[160px] leading-relaxed">
                  {selectedPackage.qrCodeData ? t('modal.installByScanning') : t('modal.processing')}
                </p>
              </div>

              {/* Technical Data */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border-[1.5px] border-[var(--gray-mid)] shadow-sm">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--gray-text)] block mb-3">{t('modal.iccidAddress')}</label>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-sm font-extrabold text-[var(--text-dark)] truncate">{selectedPackage.iccid || t('modal.generating')}</code>
                    {selectedPackage.iccid && (
                      <button
                        onClick={() => copyToClipboard(selectedPackage.iccid!, "ICCID")}
                        className="w-10 h-10 rounded-xl hover:bg-[var(--gold)]/10 text-[var(--gray-text)] hover:text-[var(--gold)] transition-all flex items-center justify-center border-none cursor-pointer"
                      >
                        {copied === "ICCID" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border-[1.5px] border-[var(--gray-mid)] shadow-sm">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--gray-text)] block mb-3">{t('modal.activationCode')}</label>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-sm font-extrabold text-[var(--text-dark)] truncate">{selectedPackage.activationCode || "N/A"}</code>
                    {selectedPackage.activationCode && (
                      <button
                        onClick={() => copyToClipboard(selectedPackage.activationCode!, "Activation Code")}
                        className="w-10 h-10 rounded-xl hover:bg-[var(--gold)]/10 text-[var(--gray-text)] hover:text-[var(--gold)] transition-all flex items-center justify-center border-none cursor-pointer"
                      >
                        {copied === "Activation Code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Stats Summary */}
            <div className="grid grid-cols-2 gap-5 mb-12">
              <div className="bg-[var(--gray-bg)] border-[1.5px] border-[var(--gray-mid)] p-6 rounded-[32px] relative overflow-hidden group shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Signal className="w-4 h-4 text-[var(--gold)]" />
                  <span className="text-[10px] font-extrabold text-[var(--gray-text)] uppercase tracking-wider">{t('modal.planData')}</span>
                </div>
                {isUsageLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)] mt-2" />
                ) : usageDetails ? (
                  <>
                    <p className="text-2xl font-extrabold text-[var(--text-dark)] font-['Sora'] leading-tight">
                      {(usageDetails.data.remaining_data_mb / 1024).toFixed(2)} GB
                    </p>
                    <p className="text-[10px] text-[var(--gray-text)] mt-2 font-bold uppercase tracking-wider">
                      {usageDetails.data.used_data_mb.toFixed(0)} MB {t('card.used')} / {(usageDetails.data.total_data_mb / 1024).toFixed(1)} GB
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/50">
                        <div 
                            className="h-full bg-[var(--gold)] shadow-[0_0_8px_rgba(201,168,76,0.4)]" 
                            style={{ width: `${Math.min(100, (usageDetails.data.used_data_mb / usageDetails.data.total_data_mb) * 100)}%` }}
                        />
                    </div>
                  </>
                ) : (
                  <p className="text-2xl font-extrabold text-[var(--text-dark)] font-['Sora']">{selectedPackage.data}</p>
                )}
              </div>
              <div className="bg-[var(--gray-bg)] border-[1.5px] border-[var(--gray-mid)] p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-extrabold text-[var(--gray-text)] uppercase tracking-wider">{t('modal.validity')}</span>
                </div>
                {isUsageLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500 mt-2" />
                ) : usageDetails && usageDetails.data.expiration_date ? (
                  <>
                    <p className="text-2xl font-extrabold text-[var(--text-dark)] font-['Sora'] leading-tight">
                      {new Date(usageDetails.data.expiration_date).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-[var(--gray-text)] mt-2 font-bold uppercase tracking-wider">
                      {usageDetails.data.status_text}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-extrabold text-[var(--text-dark)] font-['Sora']">{selectedPackage.validity}</p>
                )}
              </div>
            </div>

            {/* Live Progress Section */}
            {usageDetails && (
              <div className="mb-12 p-8 bg-[var(--navy)] rounded-[40px] border border-white/10 shadow-2xl">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h4 className="text-base font-extrabold text-white font-['Sora']">{t('usage.title')}</h4>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold mt-1">{t('usage.realtime')} {usageDetails.data.status_text}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[28px] font-black text-[var(--gold)] font-['Sora']">
                      {Math.round((usageDetails.data.used_data_mb / usageDetails.data.total_data_mb) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div 
                    className="h-full bg-[var(--gold)] shadow-[0_0_15px_rgba(201,168,76,0.6)] transition-all duration-1000 rounded-full"
                    style={{ width: `${(usageDetails.data.used_data_mb / usageDetails.data.total_data_mb) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {selectedPackage.status === "active" && (
                <Button 
                  className="flex-1 h-16 rounded-[20px] text-lg font-extrabold bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white shadow-xl shadow-gold/20 transition-all flex items-center justify-center gap-3"
                  onClick={() => setShowTopupModal(true)}
                >
                  {t('modal.topUp')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
              {selectedPackage.status === "expired" && (
                <Link href="/plans" className="flex-1 no-underline">
                  <Button className="w-full h-16 rounded-[20px] text-lg font-extrabold bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white shadow-xl shadow-gold/20 transition-all">
                    {t('modal.renew')}
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="flex-1 h-16 rounded-[20px] text-lg font-bold bg-white border-[1.5px] border-[var(--text-dark)] text-[var(--text-dark)] hover:bg-[var(--text-dark)] hover:text-white transition-all"
                onClick={() => setSelectedPackage(null)}
              >
                {t('modal.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Topup Modal Redesign */}
      {showTopupModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--navy)]/80 backdrop-blur-md"
            onClick={() => !isTopupLoading && setShowTopupModal(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-[var(--gray-mid)] rounded-[40px] shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-extrabold text-[var(--text-dark)] mb-8 font-['Sora'] tracking-tight">{t('wallet.topupTitle')} <span className="text-[var(--gold)]">(PayPal)</span></h3>
            
            <div className="space-y-6 mb-10">
              <label className="text-xs font-extrabold text-[var(--gray-text)] uppercase tracking-widest ml-1">{t('wallet.selectAmount')}</label>
              <div className="grid grid-cols-2 gap-3">
                {["10", "20", "50", "100"].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopupAmount(amount)}
                    className={`h-16 rounded-2xl border-[2px] transition-all font-extrabold text-lg flex items-center justify-center gap-1 cursor-pointer ${
                      topupAmount === amount
                        ? "border-[var(--gold)] bg-[var(--gold)]/5 text-[var(--gold)]"
                        : "border-[var(--gray-mid)] bg-white text-[var(--gray-text)] hover:border-[var(--gold)]/50"
                    }`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>
              
              <div className="relative group pt-2">
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder={t('wallet.customAmount')}
                  className="w-full h-16 px-6 bg-[var(--gray-bg)] border-[2px] border-transparent rounded-2xl focus:border-[var(--gold)] focus:bg-white outline-none text-xl font-extrabold text-[var(--text-dark)] transition-all"
                />
                <span className="absolute right-6 top-[28px] font-extrabold text-[var(--gold)]">EUR</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                className="w-full h-16 rounded-[20px] bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
                onClick={handleTopup}
                disabled={isTopupLoading || !topupAmount}
              >
                {isTopupLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    {t('wallet.payWith', { provider: 'PayPal' })}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full h-16 rounded-[20px] border-[1.5px] border-[var(--gray-mid)] text-[var(--gray-text)] font-bold hover:bg-[var(--gray-bg)] transition-all"
                onClick={() => setShowTopupModal(false)}
                disabled={isTopupLoading}
              >
                {t('wallet.cancel')}
              </Button>
            </div>
            
            <p className="text-[10px] text-center text-[var(--gray-text)] mt-6 font-bold uppercase tracking-wider">
              {t('wallet.redirectNote', { provider: 'PayPal' })}
            </p>
          </div>
        </div>
      )}

      {/* Delete Account Modal Redesign */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-red-950/80 backdrop-blur-md"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-red-100 rounded-[40px] shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-[28px] bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-[var(--text-dark)] font-['Sora'] tracking-tight">
                  {t('deleteAccount.dialogTitle')}
                </h3>
                <p className="text-[var(--gray-text)] font-medium mt-3 leading-relaxed">
                  {t('deleteAccount.dialogMessage')}
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full pt-4">
                <Button
                  className="h-16 rounded-[20px] bg-red-500 hover:bg-red-600 text-white border-none shadow-xl shadow-red-500/20 font-extrabold text-lg transition-all flex items-center justify-center gap-3"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {t('deleteAccount.processing')}
                    </>
                  ) : (
                    <>
                      {t('deleteAccount.confirm')}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-16 rounded-[20px] bg-white border-[1.5px] border-[var(--gray-mid)] text-[var(--gray-text)] font-bold transition-all"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  {t('deleteAccount.cancel')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
