
import { sql } from "@vercel/postgres";

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";

if (!ASAAS_API_KEY) {
    console.warn("ASAAS_API_KEY is not set. SaaS features will not work.");
}

export type AsaasCustomer = {
    id: string;
    name: string;
    email: string;
    cpfCnpj: string;
    mobilePhone?: string;
    externalReference?: string;
    notificationDisabled?: boolean;
};

export type AsaasSubscription = {
    id: string;
    customer: string;
    value: number;
    nextDueDate: string;
    cycle: "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY";
    description?: string;
    status: "ACTIVE" | "EXPIRED" | "OVERDUE" | "CANCELED";
};

export type AsaasPayment = {
    id: string;
    customer: string;
    subscription?: string;
    value: number;
    netValue: number;
    status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "RECEIVED_IN_CASH" | "REFUND_REQUESTED" | "CHARGEBACK_REQUESTED" | "CHARGEBACK_DISPUTE" | "AWAITING_CHARGEBACK_REVERSAL" | "DUNNING_REQUESTED" | "DUNNING_RECEIVED" | "AWAITING_RISK_ANALYSIS";
    billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
    paymentDate?: string;
    invoiceUrl: string;
    bankSlipUrl?: string;
};

// Helper for Fetch requests
// Helper for Fetch requests
async function asaasRequest<T>(endpoint: string, method: string = "GET", body?: any): Promise<T> {
    const isMockMode = (process.env.NODE_ENV === 'development' && (!ASAAS_API_KEY || ASAAS_API_KEY.includes('YOUR_')));

    if (isMockMode) {
        console.warn(`[MOCK MODE] Asaas API Call: ${method} ${endpoint}`, body);
        await new Promise(r => setTimeout(r, 1000)); // Simulate latency

        // Mock responses based on endpoint
        if (endpoint.includes('/customers')) return { id: 'cus_mock_123' } as any;
        if (endpoint.includes('/subscriptions') && method === 'POST') return { id: 'sub_mock_123', value: body?.value || 100 } as any;
        if (endpoint.includes('/subscriptions') && method === 'GET') return { data: [] } as any;
        if (endpoint.includes('/payments') && method === 'GET') {
            return {
                data: [{
                    id: 'pay_mock_123',
                    invoiceUrl: 'https://sandbox.asaas.com/doc/payment',
                    bankSlipUrl: 'https://sandbox.asaas.com/doc/payment',
                    value: 100,
                    status: 'PENDING'
                }]
            } as any;
        }
        if (endpoint.includes('/pixQrCode')) {
            return {
                encodedImage: "iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAXNSR0IArs4c6QAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsQAAA7EAZUrDhsAAAEaSURBVHja7cExAQAAAMKg9U9tCy8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4GX7gAAfLqYiUAAAAASUVORK5CYII=",
                payload: "00020126580014BR.GOV.BCB.PIX0114+5511999999999520400005303986540510.005802BR5913Asaas Gestao 6008Sua Cidade62070503***6304E2CA",
                expirationDate: "2030-01-01 00:00:00"
            } as any;
        }

        return {} as any;
    }

    if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY missing");

    const headers = {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY,
    };

    const response = await fetch(`${ASAAS_API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(`Asaas API Error [${method} ${endpoint}]:`, errorData);
        throw new Error(errorData.errors?.[0]?.description || "Asaas API Request Failed");
    }

    return response.json();
}

export const asaas = {
    // Customers
    createCustomer: async (data: Omit<AsaasCustomer, "id">): Promise<AsaasCustomer> => {
        // Check if customer already exists by email or CPF/CNPJ to avoid duplicates
        const searchParams = new URLSearchParams();
        // data.cpfCnpj might be formatted, so we should clean it? Asaas expects numbers only?
        // Usually Asaas handles it, but let's just pass it.
        searchParams.append("cpfCnpj", data.cpfCnpj);

        // Asaas GET /customers can search
        const searchResult = await asaasRequest<{ data: AsaasCustomer[] }>(`/customers?${searchParams.toString()}`);

        if (searchResult.data && searchResult.data.length > 0) {
            return searchResult.data[0];
        }

        return asaasRequest<AsaasCustomer>("/customers", "POST", data);
    },

    getCustomer: async (id: string): Promise<AsaasCustomer> => {
        return asaasRequest<AsaasCustomer>(`/customers/${id}`);
    },

    // Subscriptions
    createSubscription: async (data: {
        customer: string;
        billingType: "BOLETO" | "CREDIT_CARD" | "PIX";
        value: number;
        nextDueDate: string;
        cycle: "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY";
        description?: string;
    }): Promise<AsaasSubscription> => {
        return asaasRequest<AsaasSubscription>("/subscriptions", "POST", data);
    },

    getSubscription: async (id: string): Promise<AsaasSubscription> => {
        return asaasRequest<AsaasSubscription>(`/subscriptions/${id}`);
    },

    listSubscriptionsByCustomer: async (customer: string): Promise<AsaasSubscription[]> => {
        const res = await asaasRequest<{ data: AsaasSubscription[] }>(`/subscriptions?customer=${customer}`);
        return res.data;
    },

    // Payments / Charges
    createPayment: async (data: {
        customer: string;
        billingType: "BOLETO" | "CREDIT_CARD" | "PIX";
        value: number;
        dueDate: string;
        description?: string;
        externalReference?: string;
    }): Promise<AsaasPayment> => {
        return asaasRequest<AsaasPayment>("/payments", "POST", data);
    },

    listPaymentsBySubscription: async (subscriptionId: string): Promise<AsaasPayment[]> => {
        const res = await asaasRequest<{ data: AsaasPayment[] }>(`/payments?subscription=${subscriptionId}`);
        return res.data;
    },

    getFirstPayment: async (subscriptionId: string): Promise<AsaasPayment | null> => {
        const payments = await asaas.listPaymentsBySubscription(subscriptionId);
        if (payments && payments.length > 0) {
            // Sort by due date or creation date if needed, but usually the first one is the active one
            return payments[0];
        }
        return null;
    },

    // Payment Link
    createPaymentLink: async (data: {
        name: string;
        billingType: "BOLETO" | "CREDIT_CARD" | "PIX";
        chargeType: "DETACHED" | "RECURRENT" | "INSTALLMENT";
        showDescription?: boolean;
        nameOrBusinessName?: string;
        dueDateLimitDays?: number;
        value?: number;
        subscriptionCycle?: "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY";
        endDate?: string;
        maxInstallmentCount?: number;
    }): Promise<{ id: string, name: string, url: string }> => {
        return asaasRequest<{ id: string, name: string, url: string }>("/paymentLinks", "POST", data);
    },

    // Pix
    getPixQrCode: async (paymentId: string): Promise<{ encodedImage: string, payload: string, expirationDate: string }> => {
        return asaasRequest<{ encodedImage: string, payload: string, expirationDate: string }>(`/payments/${paymentId}/pixQrCode`);
    }
};
