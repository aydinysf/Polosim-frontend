"use client";

import { useState, useEffect } from "react";
import {
  User, LogOut, Smartphone, Clock, CheckCircle,
  AlertCircle, ChevronRight, Signal, Calendar,
  RefreshCw, X, Wifi, Loader2, Copy, Check, Trash2
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
      toast.success("Hesabınız devre dışı bırakıldı.");
      router.push("/");
    } catch (err) {
      toast.error("Hesap devre dışı bırakılamadı. Lütfen tekrar deneyin.");
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
        toast.error("Lütfen geçerli bir tutar girin.");
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
      toast.error(err.message || "Yükleme başlatılamadı.");
    } finally {
      setIsTopupLoading(false);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    if (activeTab === "all") return true;
    return pkg.status === activeTab;
  });

  const statusConfig = {
    active: { label: t('status.active'), color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    upcoming: { label: t('status.upcoming'), color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    expired: { label: t('status.expired'), color: "bg-muted text-muted-foreground border-border/50" },
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {user?.name || "User"}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.created_at ? t('memberSince', { date: new Date(user.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { month: "long", year: "numeric" }) }) : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-transparent border-border/50" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-red-500/40 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('deleteAccount.button')}
              </Button>
            </div>
          </div>

          {/* Verification Warning */}
          {user && !user.email_verified_at && (
            <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-500/20 text-amber-500 mt-1">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{t('verification.title')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('verification.message')}
                  </p>
                </div>
              </div>
              <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`}>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-500/20 whitespace-nowrap">
                  {t('verification.button')}
                </Button>
              </Link>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{packages.length}</p>
                  <p className="text-sm text-muted-foreground">{t('stats.totalPackages')}</p>
                </div>
              </div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {packages.filter((p) => p.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('stats.activeUnits')}</p>
                </div>
              </div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    ${(user as any)?.wallet_balance || "0.00"}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('stats.walletBalance')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Packages Section */}
          <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('assets.title')}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t('assets.subtitle')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={refreshPackageStatus}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  {t('assets.refresh')}
                </Button>
                <Link href="/plans">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t('assets.buyNewPlan')}
                  </Button>
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
              {(["all", "active", "upcoming", "expired"] as PackageStatus[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-all duration-200 ${activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
                    }`}
                >
                  {t(`tabs.${tab}`)}
                  <span className={`ml-3 px-2 py-0.5 rounded-lg text-xs ${activeTab === tab ? "bg-white/20" : "bg-muted"}`}>
                    {tab === "all" ? packages.length : packages.filter((p) => p.status === tab).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Package Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">{t('messages.loading')}</p>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border/50">
                  <Smartphone className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-xl font-bold text-foreground">{t('emptyState.title')}</p>
                  <p className="text-muted-foreground mt-2 max-w-xs mx-auto">{t('emptyState.description')}</p>
                  <Link href="/plans" className="mt-6 inline-block">
                    <Button>{t('emptyState.button')}</Button>
                  </Link>
                </div>
              ) : (
                filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className="group relative flex flex-col p-6 rounded-3xl bg-background/50 border border-border/50 hover:border-primary/40 hover:bg-card/60 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {pkg.flagUrl ? (
                          <div className="w-12 h-8 rounded-md overflow-hidden border border-border/50 shadow-sm flex-shrink-0">
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
                          <h3 className="font-bold text-lg text-foreground leading-tight">{pkg.name}</h3>
                          <Badge variant="outline" className={`mt-1.5 px-2 py-0 h-5 text-[10px] uppercase font-bold tracking-wider ${statusConfig[pkg.status].color}`}>
                            {statusConfig[pkg.status].label}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2 rounded-full bg-secondary/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('card.dataVolume')}</span>
                        <span className="font-bold text-foreground">{pkg.data}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('card.validityPeriod')}</span>
                        <span className="font-bold text-foreground">{pkg.validity}</span>
                      </div>

                      {/* Date Range */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(pkg.startDate).toLocaleDateString()} - {pkg.endDate ? new Date(pkg.endDate).toLocaleDateString() : "—"}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                          <span>{t('card.timelineProgress')}</span>
                          <span>{Math.round(pkg.timeProgress)}%</span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${pkg.status === 'active' ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]' : 'bg-muted-foreground/30'}`}
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
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
            onClick={() => setSelectedPackage(null)}
          />
          <div className="relative w-full max-w-xl bg-card border border-border/50 rounded-[2.5rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-6 right-6 p-3 rounded-2xl hover:bg-secondary/80 text-muted-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-6 mb-10">
              {selectedPackage.flagUrl ? (
                <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-primary/20 shadow-2xl flex-shrink-0">
                  <img
                    src={selectedPackage.flagUrl}
                    alt={selectedPackage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-7xl filter drop-shadow-xl">🌍</div>
              )}
              <div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">{selectedPackage.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className={`px-3 py-0.5 text-xs font-bold ${statusConfig[selectedPackage.status].color}`}>
                    {statusConfig[selectedPackage.status].label}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-medium">{t('modal.order')} {selectedPackage.orderId}</span>
                </div>
              </div>
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Visual Info - QR or Placeholder */}
              <div className="bg-secondary/30 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                {selectedPackage.status === "active" || selectedPackage.status === "upcoming" ? (
                  selectedPackage.qrCodeData ? (
                    <div className="p-4 bg-white rounded-3xl mb-4 shadow-xl">
                      {/* Using API fallback for stable QR generation */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedPackage.qrCodeData)}`}
                        alt="eSIM QR Code"
                        width={180}
                        height={180}
                        className="w-[180px] h-[180px]"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-4">
                      <Clock className="w-16 h-16 text-amber-500 animate-pulse" />
                    </div>
                  )
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center mb-4">
                    <AlertCircle className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}

                <h4 className="font-bold text-foreground">{t('modal.activationInfo')}</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[160px]">
                  {selectedPackage.qrCodeData ? t('modal.installByScanning') : t('modal.processing')}
                </p>
              </div>

              {/* Technical Data */}
              <div className="space-y-4">
                <div className="bg-secondary/20 p-4 rounded-2xl border border-border/40">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">{t('modal.iccidAddress')}</label>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm font-bold text-foreground truncate">{selectedPackage.iccid || t('modal.generating')}</code>
                    {selectedPackage.iccid && (
                      <button
                        onClick={() => copyToClipboard(selectedPackage.iccid!, "ICCID")}
                        className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                      >
                        {copied === "ICCID" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/20 p-4 rounded-2xl border border-border/40">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">{t('modal.activationCode')}</label>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm font-bold text-foreground truncate">{selectedPackage.activationCode || "N/A"}</code>
                    {selectedPackage.activationCode && (
                      <button
                        onClick={() => copyToClipboard(selectedPackage.activationCode!, "Activation Code")}
                        className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                      >
                        {copied === "Activation Code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Stats Summary */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-background border border-border/50 p-5 rounded-3xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-1">
                  <Signal className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('modal.planData')}</span>
                </div>
                {isUsageLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary mt-2" />
                ) : usageDetails ? (
                  <>
                    <p className="text-xl font-black text-foreground">
                      {(usageDetails.data.remaining_data_mb / 1024).toFixed(2)} GB
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {usageDetails.data.used_data_mb.toFixed(0)} MB {t('card.used')} / {(usageDetails.data.total_data_mb / 1024).toFixed(1)} GB
                    </p>
                    {/* Tiny Progress Bar in Card */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
                        <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(100, (usageDetails.data.used_data_mb / usageDetails.data.total_data_mb) * 100)}%` }}
                        />
                    </div>
                  </>
                ) : (
                  <p className="text-xl font-black text-foreground">{selectedPackage.data}</p>
                )}
              </div>
              <div className="bg-background border border-border/50 p-5 rounded-3xl">
                <div className="flex items-center gap-3 mb-1">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('modal.validity')}</span>
                </div>
                {isUsageLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500 mt-2" />
                ) : usageDetails && usageDetails.data.expiration_date ? (
                  <>
                    <p className="text-xl font-black text-foreground">
                      {new Date(usageDetails.data.expiration_date).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {usageDetails.data.status_text}
                    </p>
                  </>
                ) : (
                  <p className="text-xl font-black text-foreground">{selectedPackage.validity}</p>
                )}
              </div>
            </div>

            {/* Live Progress Section */}
            {usageDetails && (
              <div className="mb-10 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Live Consumption</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Real-time status: {usageDetails.data.status_text}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-primary">
                      {Math.round((usageDetails.data.used_data_mb / usageDetails.data.total_data_mb) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-primary/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.5)] transition-all duration-1000"
                    style={{ width: `${(usageDetails.data.used_data_mb / usageDetails.data.total_data_mb) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {selectedPackage.status === "active" && (
                <Button 
                  className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                  onClick={() => setShowTopupModal(true)}
                >
                  {t('modal.topUp')}
                </Button>
              )}
              {selectedPackage.status === "expired" && (
                <Link href="/plans" className="flex-1">
                  <Button className="w-full h-14 rounded-2xl text-lg font-bold">
                    {t('modal.renew')}
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl text-lg font-bold bg-transparent border-border hover:bg-secondary/50"
                onClick={() => setSelectedPackage(null)}
              >
                {t('modal.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showTopupModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
            onClick={() => !isTopupLoading && setShowTopupModal(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border/50 rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-foreground mb-6">Bakiye Yükle (PayPal)</h3>
            
            <div className="space-y-4 mb-8">
              <label className="text-sm font-medium text-muted-foreground">Tutar Seçin (EUR)</label>
              <div className="grid grid-cols-3 gap-2">
                {["10", "20", "50", "100"].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopupAmount(amount)}
                    className={`h-12 rounded-xl border-2 transition-all font-bold ${
                      topupAmount === amount
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>
              
              <div className="relative pt-2">
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Özel tutar girin"
                  className="w-full h-14 px-4 bg-secondary/20 border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground pt-2">EUR</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl"
                onClick={() => setShowTopupModal(false)}
                disabled={isTopupLoading}
              >
                Vazgeç
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={handleTopup}
                disabled={isTopupLoading || !topupAmount}
              >
                {isTopupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Şimdi Yükle"}
              </Button>
            </div>
            
            <p className="text-[10px] text-center text-muted-foreground mt-4">
              Ödeme işlemine devam ettiğinizde PayPal'a yönlendirileceksiniz.
            </p>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-red-500/20 rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {t('deleteAccount.dialogTitle')}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {t('deleteAccount.dialogMessage')}
                </p>
              </div>
              <div className="flex gap-3 w-full pt-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  {t('deleteAccount.cancel')}
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/20"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('deleteAccount.processing')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('deleteAccount.confirm')}
                    </>
                  )}
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
