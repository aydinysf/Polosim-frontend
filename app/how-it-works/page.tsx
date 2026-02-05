"use client";

import { Smartphone, QrCode, Wifi, CheckCircle, Globe, Zap, Shield, Clock, ChevronRight, Apple, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Choose Your Plan",
    description: "Browse our selection of 200+ destinations and choose the data plan that fits your travel needs. Select your data amount, validity period, and coverage area.",
    icon: Globe,
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    number: "02",
    title: "Complete Purchase",
    description: "Securely checkout with your preferred payment method. We accept all major credit cards, PayPal, and Apple Pay. Your eSIM will be ready instantly.",
    icon: Shield,
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    number: "03",
    title: "Scan QR Code",
    description: "After purchase, you will receive a QR code via email. Simply scan it with your phone camera to install the eSIM profile. No physical SIM card needed.",
    icon: QrCode,
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    number: "04",
    title: "Stay Connected",
    description: "Activate your eSIM when you arrive at your destination. Enjoy fast, reliable data without roaming charges. Top up anytime if you need more data.",
    icon: Wifi,
    color: "from-amber-500/20 to-orange-500/20",
  },
];

const features = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Receive your eSIM QR code within seconds after purchase. No waiting, no shipping.",
  },
  {
    icon: Shield,
    title: "Secure Connection",
    description: "Your data is protected with enterprise-grade encryption on all networks.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our support team is available around the clock to help you with any issues.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Access high-speed data in over 200 countries and territories worldwide.",
  },
];

const compatibleDevices = [
  { brand: "Apple", models: ["iPhone XS and newer", "iPad Pro (2018+)", "iPad Air (2019+)", "iPad (2019+)"] },
  { brand: "Samsung", models: ["Galaxy S20 and newer", "Galaxy Z Fold/Flip series", "Galaxy Note 20+"] },
  { brand: "Google", models: ["Pixel 3 and newer", "Pixel Fold"] },
  { brand: "Other", models: ["Motorola Razr", "Huawei P40+", "Oppo Find X3+", "Sony Xperia 1 III+"] },
];

const faqs = [
  {
    question: "What is an eSIM?",
    answer: "An eSIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan without using a physical SIM card. It is built into your device and can be programmed with different carrier profiles.",
  },
  {
    question: "How do I know if my device supports eSIM?",
    answer: "Most modern smartphones released after 2018 support eSIM. Check your device settings under Cellular/Mobile Data or search for your specific model in our compatibility checker.",
  },
  {
    question: "Can I use my eSIM immediately after purchase?",
    answer: "Yes! Your eSIM QR code is delivered instantly after purchase. You can install it right away and activate it when you arrive at your destination.",
  },
  {
    question: "Will my regular SIM still work with an eSIM?",
    answer: "Absolutely. Most devices support Dual SIM functionality, allowing you to use both your regular SIM for calls/texts and your eSIM for data simultaneously.",
  },
  {
    question: "What happens if I use all my data?",
    answer: "You can easily top up your eSIM with additional data through our app or website. The process takes just a few minutes.",
  },
  {
    question: "Is the eSIM reusable?",
    answer: "Each eSIM profile is for single use. However, you can purchase a new eSIM anytime for your next trip at no extra installation fee.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-6">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Simple Setup Process</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 sm:text-4xl">
            How It Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto sm:text-lg">
            Get connected in minutes. No physical SIM cards, no store visits, no hassle. Just instant mobile data wherever you travel.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${step.color} backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/50`}
              >
                <span className="absolute top-4 right-4 text-7xl font-bold text-foreground/5">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-card/80 border border-border/50 flex items-center justify-center mb-6">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && index % 2 === 0 && (
                  <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary items-center justify-center shadow-lg">
                    <ChevronRight className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Choose POLO SIM?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience hassle-free connectivity with our premium eSIM service
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatible Devices */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Compatible Devices</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our eSIM works with most modern smartphones and tablets
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {compatibleDevices.map((device) => (
              <div
                key={device.brand}
                className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  {device.brand === "Apple" && <Apple className="w-5 h-5" />}
                  {device.brand}
                </h3>
                <ul className="space-y-2">
                  {device.models.map((model) => (
                    <li key={model} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {model}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" className="border-border/50 hover:border-primary hover:bg-primary/10 text-foreground bg-transparent">
              Check Device Compatibility
            </Button>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-16 px-4 bg-card/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Installation Guide</h2>
            <p className="text-muted-foreground text-lg">Quick setup for iOS and Android devices</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* iOS */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center">
                  <Apple className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">iOS Installation</h3>
              </div>
              <ol className="space-y-4">
                {[
                  "Open Camera app and scan QR code",
                  "Tap 'Add eSIM' notification",
                  "Follow on-screen instructions",
                  "Label your plan (e.g., 'Travel Data')",
                  "Enable data roaming when abroad",
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Android */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Android Installation</h3>
              </div>
              <ol className="space-y-4">
                {[
                  "Go to Settings > Network & Internet",
                  "Tap 'SIMs' or 'Mobile Network'",
                  "Select 'Add eSIM' or '+' button",
                  "Scan QR code with camera",
                  "Confirm and activate your plan",
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about eSIM</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 to-cyan-500/10 backdrop-blur-sm">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join millions of travelers who stay connected with POLO SIM. Browse our plans and get instant connectivity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/plans">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Browse Plans
                </Button>
              </Link>
              <Link href="/support">
                <Button size="lg" variant="outline" className="border-border/50 hover:border-primary hover:bg-primary/10 text-foreground bg-transparent px-8">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
