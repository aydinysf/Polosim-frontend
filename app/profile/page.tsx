"use client";

import { useState, useEffect } from "react";
import { 
  User, Settings, LogOut, Smartphone, Clock, CheckCircle, 
  AlertCircle, ChevronRight, QrCode, Signal, Calendar,
  Download, RefreshCw, X, Wifi, Globe, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { orderService, type Order, type EsimDetails } from "@/lib/services/orderService";
import { esimService, type EsimUsage } from "@/lib/services/esimService";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PackageStatus = "all" | "active" | "pending" | "expired";

interface EsimPackage {
  id: string;
  orderId: number;
  name: string;
  flag: string;
  data: string;
  validity: string;
  status: "active" | "pending" | "expired";
  usedData: string;
  remainingData: string;
  usagePercentage: number;
  expiresAt: string | null;
  activatedAt: string | null;
  qrCodeUrl: string | null;
  qrCodeData: string | null;
  iccid: string | null;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PackageStatus>("all");
  const [selectedPackage, setSelectedPackage] = useState<EsimPackage | null>(null);
  const [packages, setPackages] = useState<EsimPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const loadPackages = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const orders = await orderService.getAll();
      const esimPackages: EsimPackage[] = [];

      for (const order of orders) {
        if (order.esim_details && order.esim_details.length > 0) {
          for (const esim of order.esim_details) {
            let usage: EsimUsage | null = null;
            
            if (esim.iccid && esim.status === "active") {
              try {
                usage = await esimService.getUsage(esim.iccid);
              } catch {
                // Usage not available
              }
            }

            const orderItem = order.items[0];
            const product = orderItem?.product;

            esimPackages.push({
              id: esim.iccid || `pending-${order.id}`,
              orderId: order.id,
              name: product?.country?.name || product?.region?.name || product?.name || "Unknown",
              flag: getFlag(product?.country?.iso_code),
              data: product?.data_amount || "N/A",
              validity: `${product?.validity_days || 0} days`,
              status: esim.status === "active" ? "active" : esim.status === "pending" ? "pending" : "expired",
              usedData: usage ? `${(usage.used_data_mb / 1024).toFixed(1)}GB` : "0GB",
              remainingData: usage ? `${(usage.remaining_data_mb / 1024).toFixed(1)}GB` : product?.data_amount || "N/A",
              usagePercentage: usage?.usage_percentage || 0,
              expiresAt: esim.expires_at || null,
              activatedAt: esim.activated_at || null,
              qrCodeUrl: esim.qr_code_url || null,
              qrCodeData: esim.qr_code_data || null,
              iccid: esim.iccid || null,
            });
          }
        }
      }

      setPackages(esimPackages);
    } catch (err) {
      console.error("Failed to load packages:", err);
      setError("Failed to load packages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFlag = (isoCode?: string): string => {
    if (!isoCode) return "🌐";
    const codePoints = isoCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const refreshPackageStatus = async () => {
    await loadPackages();
  };

  const filteredPackages = packages.filter((pkg) => {
    if (activeTab === "all") return true;
    return pkg.status === activeTab;
  });

  const statusConfig = {
    active: { label: "Active", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    pending: { label: "Pending QR", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    expired: { label: "Expired", color: "bg-muted text-muted-foreground border-border/50" },
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-transparent border-border/50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                className="bg-transparent border-border/50 text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{packages.length}</p>
                  <p className="text-xs text-muted-foreground">Total Packages</p>
                </div>
              </div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {packages.filter((p) => p.status === "active").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {packages.filter((p) => p.status === "pending").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {packages.filter((p) => p.status === "expired").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Expired</p>
                </div>
              </div>
            </div>
          </div>

          {/* Packages Section */}
          <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-foreground">My eSIM Packages</h2>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent"
                  onClick={refreshPackageStatus}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Link href="/plans">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Buy New Package
                  </Button>
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                {error}
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(["all", "active", "pending", "expired"] as PackageStatus[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {tab === "all" ? "All Packages" : tab}
                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-background/20 text-xs">
                    {tab === "all" 
                      ? packages.length 
                      : packages.filter((p) => p.status === tab).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Package List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading packages...</p>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No packages found</p>
                  <Link href="/plans" className="text-primary hover:underline text-sm mt-2 inline-block">
                    Browse available plans
                  </Link>
                </div>
              ) : (
                filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{pkg.flag}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                          <Badge variant="outline" className={statusConfig[pkg.status].color}>
                            {statusConfig[pkg.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pkg.data} - {pkg.validity}
                        </p>
                        {pkg.status === "active" && (
                          <div className="mt-2 w-48">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>{pkg.usedData} used</span>
                              <span>{pkg.remainingData} left</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${pkg.usagePercentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedPackage(null)}
          />
          <div className="relative w-full max-w-lg bg-card border border-border/50 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Package Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">{selectedPackage.flag}</div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedPackage.name}</h2>
                <Badge variant="outline" className={statusConfig[selectedPackage.status].color}>
                  {statusConfig[selectedPackage.status].label}
                </Badge>
              </div>
            </div>

            {/* QR Code Section - Only for active packages */}
            {selectedPackage.status === "active" && (selectedPackage.qrCodeUrl || selectedPackage.qrCodeData) && (
              <div className="bg-background/50 rounded-xl p-6 mb-6 text-center">
                {selectedPackage.qrCodeUrl ? (
                  <img 
                    src={selectedPackage.qrCodeUrl || "/placeholder.svg"} 
                    alt="eSIM QR Code" 
                    className="w-48 h-48 mx-auto rounded-xl mb-4"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center mb-4">
                    <QrCode className="w-32 h-32 text-foreground" />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-2">Scan with your device to install</p>
                {selectedPackage.qrCodeUrl && (
                  <a href={selectedPackage.qrCodeUrl} download>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Download QR
                    </Button>
                  </a>
                )}
              </div>
            )}

            {/* Pending Message */}
            {selectedPackage.status === "pending" && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-500">QR Code Pending</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your eSIM is being processed. The QR code will be sent to your email within 5-10 minutes.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 bg-transparent border-amber-500/30 text-amber-500"
                  onClick={refreshPackageStatus}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Status
                </Button>
              </div>
            )}

            {/* Package Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Package Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Signal className="w-4 h-4" />
                    <span className="text-xs">Data</span>
                  </div>
                  <p className="font-semibold text-foreground">{selectedPackage.data}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Validity</span>
                  </div>
                  <p className="font-semibold text-foreground">{selectedPackage.validity}</p>
                </div>
              </div>

              {selectedPackage.status === "active" && (
                <>
                  {/* Usage */}
                  <div className="bg-background/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Data Usage</span>
                      <span className="text-sm font-medium text-foreground">
                        {selectedPackage.usedData} / {selectedPackage.data}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${selectedPackage.usagePercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedPackage.remainingData} remaining
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Activated</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedPackage.activatedAt ? new Date(selectedPackage.activatedAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Expires</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedPackage.expiresAt ? new Date(selectedPackage.expiresAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* ICCID */}
                  {selectedPackage.iccid && (
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">ICCID</p>
                      <p className="text-sm font-mono text-foreground">{selectedPackage.iccid}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {selectedPackage.status === "active" && (
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Wifi className="w-4 h-4 mr-2" />
                  Top Up
                </Button>
              )}
              {selectedPackage.status === "expired" && (
                <Link href="/plans" className="flex-1">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Globe className="w-4 h-4 mr-2" />
                    Buy Again
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedPackage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
