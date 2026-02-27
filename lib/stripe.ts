import "server-only";

import Stripe from "stripe";

// Build aşamasında (örneğin netlify/vercel üzerinde veya docker build'de)
// env değişkeni yoksa Next.js derlemesi çökmesin diye fallback ("dummy") ekliyoruz.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key_for_build", {
    apiVersion: "2023-10-16", // API versiyonu TS tarafında hata veriyorsa kaldırabiliriz veya doğru sürümü yazabiliriz
} as any);
