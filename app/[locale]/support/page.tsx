"use client";

import { useState } from "react";
import { MessageCircle, Mail, Phone, FileText, HelpCircle, ChevronDown, ChevronRight, Search, Clock, CheckCircle, Wifi, Smartphone, CreditCard, Globe, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";

const supportCategories = [
  {
    icon: Smartphone,
    title: "Installation & Setup",
    description: "Help with installing and activating your eSIM",
    articles: 12,
  },
  {
    icon: Wifi,
    title: "Connectivity Issues",
    description: "Troubleshoot connection and network problems",
    articles: 8,
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description: "Questions about charges, refunds, and invoices",
    articles: 10,
  },
  {
    icon: Globe,
    title: "Coverage & Plans",
    description: "Information about destinations and data plans",
    articles: 15,
  },
  {
    icon: Settings,
    title: "Account Management",
    description: "Manage your profile, orders, and preferences",
    articles: 6,
  },
  {
    icon: AlertCircle,
    title: "Report an Issue",
    description: "Submit a technical problem or bug report",
    articles: 4,
  },
];

const popularArticles = [
  { title: "How to install an eSIM on iPhone", views: "12.5k" },
  { title: "How to install an eSIM on Android", views: "10.2k" },
  { title: "My eSIM is not connecting to the network", views: "8.7k" },
  { title: "How to check remaining data balance", views: "7.3k" },
  { title: "Can I use eSIM and physical SIM together?", views: "6.8k" },
  { title: "How to top up my existing eSIM", views: "5.9k" },
];

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is an eSIM and how does it work?",
        a: "An eSIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan without using a physical SIM card. It's built into your device and can be programmed with different carrier profiles. You simply scan a QR code to install and activate your plan.",
      },
      {
        q: "Is my device compatible with eSIM?",
        a: "Most smartphones released after 2018 support eSIM, including iPhone XS and newer, Samsung Galaxy S20+, Google Pixel 3+, and many others. Check our compatibility page or look for 'eSIM' in your device's cellular settings.",
      },
      {
        q: "How quickly will I receive my eSIM?",
        a: "Your eSIM QR code is delivered instantly via email after your purchase is confirmed. There's no shipping or waiting time involved.",
      },
    ],
  },
  {
    category: "Installation",
    questions: [
      {
        q: "How do I install my eSIM?",
        a: "After purchase, you'll receive an email with a QR code. On iPhone, open Camera and scan the code. On Android, go to Settings > Network > Add eSIM and scan. Follow the on-screen prompts to complete installation.",
      },
      {
        q: "Can I install the eSIM before my trip?",
        a: "Yes! We recommend installing your eSIM before you travel. You can install it anytime and simply activate data roaming when you arrive at your destination.",
      },
      {
        q: "What if the QR code doesn't work?",
        a: "Try these steps: 1) Ensure you have a stable WiFi connection, 2) Make sure your device supports eSIM, 3) Try manual installation using the activation code. If issues persist, contact our 24/7 support.",
      },
    ],
  },
  {
    category: "Usage & Data",
    questions: [
      {
        q: "How do I check my remaining data?",
        a: "You can check your data usage in several ways: 1) Through our POLO SIM app, 2) In your phone's cellular settings, 3) By logging into your account on our website.",
      },
      {
        q: "What happens when I run out of data?",
        a: "When your data is depleted, you can easily top up through our app or website. The additional data is added to your existing eSIM profile - no reinstallation needed.",
      },
      {
        q: "Can I use my eSIM for calls and texts?",
        a: "Our eSIM plans are data-only. You can use apps like WhatsApp, Telegram, or Skype for calls and messages. Your regular SIM can still handle traditional calls and SMS.",
      },
    ],
  },
  {
    category: "Billing",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit encryption.",
      },
      {
        q: "Can I get a refund?",
        a: "Yes, we offer refunds for unused eSIMs within 30 days of purchase. Once an eSIM is installed or activated, it cannot be refunded. Contact support for refund requests.",
      },
      {
        q: "Do you offer business invoices?",
        a: "Yes, we provide detailed invoices for all purchases. Business customers can add company details during checkout or request updated invoices through their account.",
      },
    ],
  },
];

const contactMethods = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team",
    availability: "Available 24/7",
    action: "Start Chat",
    primary: true,
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "support@polosim.com",
    availability: "Response within 2 hours",
    action: "Send Email",
    primary: false,
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "+1 (800) 123-4567",
    availability: "Mon-Fri, 9AM-6PM EST",
    action: "Call Now",
    primary: false,
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (key: string) => {
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Help Center</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 sm:text-4xl">
            How Can We Help?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:text-lg">
            Find answers to common questions or get in touch with our support team
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1 pl-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-lg"
                  />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportCategories.map((category) => (
              <button
                key={category.title}
                className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm text-left hover:border-primary/50 hover:bg-card/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <span className="text-xs text-primary font-medium">{category.articles} articles</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 px-4 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Popular Articles</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <button
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/50 hover:bg-card/50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">{article.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">{article.views} views</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Quick answers to common questions</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.questions.map((faq, index) => {
                    const key = `${category.category}-${index}`;
                    const isExpanded = expandedFaq === key;
                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(key)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-card/50 transition-colors"
                        >
                          <span className="font-medium text-foreground pr-4">{faq.q}</span>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4">
                            <p className="text-muted-foreground">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4 bg-card/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Still Need Help?</h2>
            <p className="text-muted-foreground">Our support team is here for you 24/7</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className={`p-6 rounded-2xl border text-center ${
                  method.primary
                    ? "border-primary/50 bg-gradient-to-br from-primary/10 to-cyan-500/10"
                    : "border-border/50 bg-card/30"
                } backdrop-blur-sm`}
              >
                <div className={`w-14 h-14 rounded-xl ${method.primary ? "bg-primary" : "bg-primary/10"} mx-auto flex items-center justify-center mb-4`}>
                  <method.icon className={`w-7 h-7 ${method.primary ? "text-primary-foreground" : "text-primary"}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{method.description}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-primary mb-4">
                  <Clock className="w-3 h-3" />
                  {method.availability}
                </div>
                <Button
                  className={method.primary ? "bg-primary text-primary-foreground hover:bg-primary/90 w-full" : "w-full bg-transparent"}
                  variant={method.primary ? "default" : "outline"}
                >
                  {method.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Banner */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-foreground font-medium">All Systems Operational</span>
            </div>
            <Link href="#" className="text-sm text-primary hover:underline">
              View Status Page
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
