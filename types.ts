export interface Service {
    id: number;
    title: string;
    description?: string;
    duration?: number;
    price: number;
    created_at: string;
}

export interface Booking {
    id: number;
    created_at: string;
    booking_date: string;
    time_slot: string;
    purpose?: string;
    questions?: string;
    total_cost: number;
    payment_method?: string;
    document_urls?: string[];
    user_id: string;
    status?: string;
    consultation_type: {
        title: string;
    } | null;
}

export interface ChatMessage {
    id: number;
    user_id: string;
    content: string;
    sender_is_admin: boolean;
    created_at: string;
}

export interface SupabaseUser {
    id: string;
    email?: string;
    app_metadata?: {
        role?: 'admin';
        [key: string]: any;
    };
    last_sign_in_at?: string;
    // Add other user properties if needed
}

export interface PartnerEOI {
    id: number;
    created_at: string;
    name: string;
    email: string;
    company_name?: string;
    phone_number?: string;
    message: string;
    status: string;
}
