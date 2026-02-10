"use client";

import { Smartphone, Signal, Globe, Wifi, ArrowRight, Users, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function PlansRegionsTabs() {
  const router = useRouter();

  return (
    <section className="py-16 sm:py-24 px-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
            Why Create an Account?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Unlock exclusive benefits and manage your eSIMs easily with a free account.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Track Orders */}
          <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-foreground">Track Your Orders</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">View all your purchases and eSIM activations from your profile page anytime.</p>
            </div>
          </div>

          {/* Monitor Usage */}
          <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-card/50">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Signal className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-foreground">Monitor Usage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Check your data usage and remaining balance in real-time from your dashboard.</p>
            </div>
          </div>

          {/* Affiliate Program */}
          <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-amber-500/50 hover:bg-card/50">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                <Users className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-foreground">Affiliate Program</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Earn commissions by referring friends and sharing your unique referral link.</p>
            </div>
          </div>

          {/* Exclusive Campaigns */}
          <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-rose-500/50 hover:bg-card/50">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 group-hover:bg-rose-500/20 transition-colors">
                <Gift className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-foreground">Exclusive Campaigns</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Access special discounts, promotions and member-only deals throughout the year.</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 gap-2"
            onClick={() => router.push("/sign-in")}
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
