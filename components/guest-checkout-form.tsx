"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GuestCheckoutFormProps {
  onGuestInfoChange: (info: {
    guest_email: string;
    guest_name: string;
    guest_surname: string;
  }) => void;
}

export function GuestCheckoutForm({ onGuestInfoChange }: GuestCheckoutFormProps) {
  const [guestInfo, setGuestInfo] = useState({
    guest_email: "",
    guest_name: "",
    guest_surname: ""
  });

  const handleInputChange = (field: keyof typeof guestInfo, value: string) => {
    const newInfo = { ...guestInfo, [field]: value };
    setGuestInfo(newInfo);
    onGuestInfoChange(newInfo);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Guest Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="guest_email">Email *</Label>
          <Input
            id="guest_email"
            type="email"
            placeholder="your.email@example.com"
            value={guestInfo.guest_email}
            onChange={(e) => handleInputChange("guest_email", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guest_name">First Name *</Label>
            <Input
              id="guest_name"
              type="text"
              placeholder="John"
              value={guestInfo.guest_name}
              onChange={(e) => handleInputChange("guest_name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest_surname">Last Name *</Label>
            <Input
              id="guest_surname"
              type="text"
              placeholder="Doe"
              value={guestInfo.guest_surname}
              onChange={(e) => handleInputChange("guest_surname", e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}