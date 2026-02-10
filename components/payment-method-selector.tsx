"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard } from "lucide-react";

interface PaymentMethodSelectorProps {
  isGuest: boolean;
  selectedMethod: 'wallet' | 'stripe';
  onMethodChange: (method: 'wallet' | 'stripe') => void;
  walletBalance?: number;
}

export function PaymentMethodSelector({ 
  isGuest, 
  selectedMethod, 
  onMethodChange, 
  walletBalance = 0 
}: PaymentMethodSelectorProps) {
  // Guests can only use Stripe
  const availableMethods = isGuest ? ['stripe'] : ['wallet', 'stripe'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
          {availableMethods.includes('wallet') && (
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50">
              <RadioGroupItem value="wallet" id="wallet" />
              <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                <Wallet className="w-5 h-5" />
                <div>
                  <div className="font-medium">Wallet Balance</div>
                  <div className="text-sm text-muted-foreground">
                    Available: €{(walletBalance / 100).toFixed(2)}
                  </div>
                </div>
              </Label>
            </div>
          )}

          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50">
            <RadioGroupItem value="stripe" id="stripe" />
            <Label htmlFor="stripe" className="flex items-center gap-3 cursor-pointer flex-1">
              <CreditCard className="w-5 h-5" />
              <div>
                <div className="font-medium">Credit/Debit Card</div>
                <div className="text-sm text-muted-foreground">
                  Secure payment via Stripe
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {isGuest && (
          <p className="text-sm text-muted-foreground mt-4">
            Guest checkout requires payment by credit/debit card.
          </p>
        )}
      </CardContent>
    </Card>
  );
}