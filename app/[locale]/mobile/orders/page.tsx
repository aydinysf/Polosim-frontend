"use client";

import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, AlertCircle, ChevronRight, Download, RefreshCw, Loader2 } from "lucide-react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { Button } from "@/components/ui/button";
import { orderService, type Order } from "@/lib/services/orderService";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedText } from "@/lib/product-helpers";

export default function OrdersPage() {
  const locale = useLocale();
  const t = useTranslations('Common');
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        const data = await orderService.getAll();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const tabs = [
    { id: "all", label: "All" },
    { id: "paid", label: "Paid" },
    { id: "pending", label: "Pending" },
  ];

  const getStatusIcon = (order: Order) => {
    switch (order.status) {
      case "paid":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "pending":
      case "processing":
        return <Clock className="w-4 h-4 text-primary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (order: Order) => {
    switch (order.status) {
      case "paid":
      case "completed":
        return "bg-emerald-500/10 text-emerald-500";
      case "pending":
      case "processing":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <main className="pt-16 pb-24">
        {/* Page Title */}
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your eSIM purchases</p>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="px-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card/50 border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                      📦
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">Order #{order.order_number || order.id}</h3>
                      <p className="text-xs text-muted-foreground">
                        {order.items?.length || 0} items • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order)}`}>
                    {getStatusIcon(order)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Total</span>
                  <span className="font-bold text-foreground">€{(order.total_amount || order.total || 0).toFixed(2)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs h-9 bg-transparent"
                    onClick={() => window.location.href = `/${locale}/orders/${order.id}`}
                  >
                    <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
