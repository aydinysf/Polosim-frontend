"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle, AlertCircle, ChevronRight, Download, RefreshCw } from "lucide-react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { Button } from "@/components/ui/button";

type OrderStatus = "active" | "completed" | "expired";

const orders = [
  {
    id: "ORD-2024-001",
    country: "Turkey",
    flag: "🇹🇷",
    plan: "10GB - 30 Days",
    price: 14.99,
    status: "active" as OrderStatus,
    purchaseDate: "2024-01-15",
    expiryDate: "2024-02-14",
    dataUsed: 3.2,
    dataTotal: 10,
  },
  {
    id: "ORD-2024-002",
    country: "Europe",
    flag: "🇪🇺",
    plan: "20GB - 30 Days",
    price: 29.99,
    status: "active" as OrderStatus,
    purchaseDate: "2024-01-20",
    expiryDate: "2024-02-19",
    dataUsed: 8.5,
    dataTotal: 20,
  },
  {
    id: "ORD-2023-089",
    country: "Japan",
    flag: "🇯🇵",
    plan: "15GB - 14 Days",
    price: 24.99,
    status: "completed" as OrderStatus,
    purchaseDate: "2023-12-01",
    expiryDate: "2023-12-15",
    dataUsed: 15,
    dataTotal: 15,
  },
  {
    id: "ORD-2023-076",
    country: "Thailand",
    flag: "🇹🇭",
    plan: "8GB - 7 Days",
    price: 11.99,
    status: "expired" as OrderStatus,
    purchaseDate: "2023-11-10",
    expiryDate: "2023-11-17",
    dataUsed: 5.2,
    dataTotal: 8,
  },
];

const tabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "expired", label: "Expired" },
];

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "active":
      return <Clock className="w-4 h-4 text-primary" />;
    case "completed":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case "expired":
      return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "active":
      return "bg-primary/10 text-primary";
    case "completed":
      return "bg-emerald-500/10 text-emerald-500";
    case "expired":
      return "bg-muted text-muted-foreground";
  }
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

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
                    <span className="text-3xl">{order.flag}</span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{order.country}</h3>
                      <p className="text-xs text-muted-foreground">{order.plan}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>

                {/* Data Usage (for active orders) */}
                {order.status === "active" && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Data Usage</span>
                      <span className="font-medium text-foreground">{order.dataUsed}GB / {order.dataTotal}GB</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(order.dataUsed / order.dataTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Order Details */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Order: {order.id}</span>
                  <span>${order.price.toFixed(2)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {order.status === "active" ? (
                    <>
                      <Button size="sm" variant="outline" className="flex-1 text-xs h-9 bg-transparent">
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        View QR
                      </Button>
                      <Button size="sm" className="flex-1 text-xs h-9 bg-primary text-primary-foreground">
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Top Up
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-9 bg-transparent">
                      <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                      Buy Again
                    </Button>
                  )}
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
