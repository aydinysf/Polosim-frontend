"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard, Send } from "lucide-react";

interface PaymentMethodSelectorProps {
  isGuest: boolean;
  selectedMethod: 'wallet' | 'stripe' | 'paypal';
  onMethodChange: (method: 'wallet' | 'stripe' | 'paypal') => void;
  walletBalance?: number;
}

export function PaymentMethodSelector({ 
  isGuest, 
  selectedMethod, 
  onMethodChange, 
  walletBalance = 0 
}: PaymentMethodSelectorProps) {
  // Guests can use Stripe or PayPal
  const availableMethods = isGuest ? ['stripe', 'paypal'] : ['wallet', 'stripe', 'paypal'];

  return (
    <div className="w-full bg-white border-[1.5px] border-[var(--gray-mid)] rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[var(--text-dark)] mb-5 font-['Sora']">Ödeme Yöntemi</h3>
      
      <RadioGroup value={selectedMethod} onValueChange={onMethodChange} className="space-y-3">
        {availableMethods.includes('wallet') && (
          <div className={`flex items-center space-x-2 p-4 border-[1.5px] rounded-2xl transition-all ${selectedMethod === 'wallet' ? 'border-[var(--gold)] bg-[var(--gray-bg)]' : 'border-[var(--gray-mid)] hover:border-[var(--gold)]/50'}`}>
            <RadioGroupItem value="wallet" id="wallet" className="text-[var(--gold)]" />
            <Label htmlFor="wallet" className="flex items-center gap-4 cursor-pointer flex-1">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-[var(--text-dark)]">Cüzdan Bakiyesi</div>
                <div className="text-xs text-[var(--gray-text)] font-medium">
                  Mevcut: €{(walletBalance / 100).toFixed(2)}
                </div>
              </div>
            </Label>
          </div>
        )}

        <div className={`flex items-center space-x-2 p-4 border-[1.5px] rounded-2xl transition-all ${selectedMethod === 'stripe' ? 'border-[var(--gold)] bg-[var(--gray-bg)]' : 'border-[var(--gray-mid)] hover:border-[var(--gold)]/50'}`}>
          <RadioGroupItem value="stripe" id="stripe" className="text-[var(--gold)]" />
          <Label htmlFor="stripe" className="flex items-center gap-4 cursor-pointer flex-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[var(--text-dark)] flex items-center gap-2">
                Kredi / Banka Kartı
                <span className="text-[9px] bg-[var(--gold)]/10 text-[var(--gold)] px-2 py-0.5 rounded-full uppercase font-extrabold tracking-wider">
                  APPLE & GOOGLE PAY
                </span>
              </div>
              <div className="text-xs text-[var(--gray-text)] font-medium">
                Stripe ile güvenli ödeme yapın
              </div>
            </div>
          </Label>
        </div>

        <div className={`flex items-center space-x-2 p-4 border-[1.5px] rounded-2xl transition-all ${selectedMethod === 'paypal' ? 'border-[var(--gold)] bg-[var(--gray-bg)]' : 'border-[var(--gray-mid)] hover:border-[var(--gold)]/50'}`}>
          <RadioGroupItem value="paypal" id="paypal" className="text-[var(--gold)]" />
          <Label htmlFor="paypal" className="flex items-center gap-4 cursor-pointer flex-1">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
               <span className="font-extrabold text-blue-600 text-lg">P</span>
               <span className="font-extrabold text-sky-400 text-lg">P</span>
            </div>
            <div>
              <div className="font-bold text-[var(--text-dark)]">PayPal</div>
              <div className="text-xs text-[var(--gray-text)] font-medium">
                PayPal hesabınızla ödeme yapın
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {isGuest && (
        <p className="text-[11px] text-[var(--gray-text)] mt-4 font-semibold uppercase tracking-[0.5px]">
          Misafir girişi Kredi Kartı ve PayPal&apos;ı destekler.
        </p>
      )}
    </div>
  );
}