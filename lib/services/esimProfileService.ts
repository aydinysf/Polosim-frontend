import { webApi, getFlagFromISO } from "../api-client";
import type { ApiError } from "../api-client";

export interface EsimPackageData {
    id: string;
    orderId: number | null;
    name: string;
    flag: string;
    flagUrl: string | null;
    data: string;
    validityDays: number;
    status: "active" | "upcoming" | "expired";
    startDate: string;
    endDate: string | null;
    iccid: string | null;
    qrCodeData: string | null;  // activation_string (LPA:1$...) for QR
    activationCode: string | null;
    smdpAddress: string | null;
    manualCode: string | null;
    plans: {
        totalData: number;
        remainingData: number;
        status: string;
        expiresAt: string | null;
    }[];
}

interface RawEsim {
    id: number;
    iccid: string;
    status: string;
    activation_string: string;
    smdp_address: string;
    activation_code: string;
    manual_code: string;
    qr_code: string | null;
    provider: string;
    created_at: string;
    order_id: number | null;
    order_status: string | null;
    product_name: string | { en?: string; tr?: string } | null;
    data_amount: string | null;
    data_amount_mb: number | null;
    duration_days: number | null;
    country_name: string | { en?: string; tr?: string } | null;
    country_iso: string | null;
    flag_url: string | null;
    plans: {
        total_data: number;
        remaining_data: number;
        status: string;
        expires_at: string | null;
    }[];
}

function resolveText(val: string | { en?: string; tr?: string } | null | undefined): string {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val.en || val.tr || "";
}

function mapStatus(raw: string): "active" | "upcoming" | "expired" {
    switch (raw) {
        case "active": return "active";
        case "expired":
        case "cancelled":
            return "expired";
        default:
            return "upcoming";
    }
}

export const esimProfileService = {
    async getMyEsims(): Promise<EsimPackageData[]> {
        try {
            const response = await webApi.get<{ success: boolean; data: RawEsim[] }>("/aktive-esims");
            const data = response.data?.data;

            if (!Array.isArray(data)) return [];

            return data.map((esim) => {
                const flagUrl = esim.flag_url || getFlagFromISO(esim.country_iso);
                const validityDays = esim.duration_days || 0;

                // endDate'i created_at + duration_days'den hesapla
                let endDate: string | null = null;
                if (esim.created_at && validityDays > 0) {
                    const start = new Date(esim.created_at);
                    start.setDate(start.getDate() + validityDays);
                    endDate = start.toISOString();
                }

                return {
                    id: esim.iccid || `esim-${esim.id}`,
                    orderId: esim.order_id,
                    name:
                        resolveText(esim.product_name) ||
                        resolveText(esim.country_name) ||
                        "eSIM Package",
                    flag: esim.country_iso || "",
                    flagUrl: flagUrl || null,
                    data: esim.data_amount || "N/A",
                    validityDays,
                    status: mapStatus(esim.status),
                    startDate: esim.created_at,
                    endDate,
                    iccid: esim.iccid || null,
                    qrCodeData: esim.activation_string || esim.qr_code || esim.activation_code || null,
                    activationCode: esim.activation_code || null,
                    smdpAddress: esim.smdp_address || null,
                    manualCode: esim.manual_code || null,
                    plans: (esim.plans || []).map((p) => ({
                        totalData: p.total_data,
                        remainingData: p.remaining_data,
                        status: p.status,
                        expiresAt: p.expires_at,
                    })),
                };
            });
        } catch {
            return [];
        }
    },
};
