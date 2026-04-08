"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                <div className="font-medium flex items-center gap-2">
                  Credit/Debit Card
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                    Apple & Google Pay
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Pay securely via Stripe
                </div>
              </div>

            </Label>
          </div>

          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="font-bold text-blue-600">P</span>
                <span className="font-bold text-sky-400">P</span>
              </div>
              <div>
                <div className="font-medium">PayPal</div>
                <div className="text-sm text-muted-foreground">
                  Pay with your PayPal account
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {isGuest && (
          <p className="text-sm text-muted-foreground mt-4">
            Guest checkout supports Credit Card and PayPal.
          </p>
        )}
      </CardContent>
    </Card>
  );
}