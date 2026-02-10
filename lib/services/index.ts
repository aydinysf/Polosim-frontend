// API Services Index
export { authService } from "./authService";
export type { User, LoginRequest, RegisterRequest, AuthResponse } from "./authService";

export { countryService } from "./countryService";
export type { Country } from "./countryService";

export { regionService } from "./regionService";
export type { Region } from "./regionService";

export { productService } from "./productService";
export type { Product, ProductFilters } from "./productService";

export { cartService } from "./cartService";
export type { Cart, CartItem } from "./cartService";

export { checkoutService } from "./checkoutService";
export type { CheckoutPreviewRequest, CheckoutPreviewResponse, CheckoutExecuteRequest, CheckoutExecuteResponse } from "./checkoutService";

export { orderService } from "./orderService";
export type { Order, OrderItem, EsimDetails } from "./orderService";

export { esimService } from "./esimService";
export type { EsimUsage, EsimInfo } from "./esimService";

export { bannerService } from "./bannerService";
export type { Banner } from "./bannerService";

export { faqService } from "./faqService";
export type { Faq, FaqCategory } from "./faqService";

export { affiliateService } from "./affiliateService";
export type { AffiliateDashboard, AffiliateLedger, AffiliateCoupon } from "./affiliateService";
