import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Basic phone number validation (US format)
function isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith("1"));
}

function normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) return `+1${cleaned}`;
    if (cleaned.length === 11 && cleaned.startsWith("1")) return `+${cleaned}`;
    return `+${cleaned}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone } = body;

        if (!phone || typeof phone !== "string") {
            return NextResponse.json({ error: "Phone number required" }, { status: 400 });
        }

        if (!isValidPhone(phone)) {
            return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
        }

        const normalized = normalizePhone(phone);

        // Check if already subscribed
        const { data: existing } = await supabase
            .from("alert_subscribers")
            .select("id, status")
            .eq("phone", normalized)
            .single();

        if (existing) {
            if (existing.status === "active") {
                return NextResponse.json({ message: "You're already subscribed!" });
            }
            // Re-activate if previously unsubscribed
            await supabase
                .from("alert_subscribers")
                .update({ status: "pending" })
                .eq("id", existing.id);
            return NextResponse.json({ message: "You've been re-subscribed! You'll receive alerts once approved." });
        }

        // Insert new subscriber
        const { error } = await supabase
            .from("alert_subscribers")
            .insert({
                phone: normalized,
                status: "pending",
                chat_id: null,
            });

        if (error) {
            console.error("Subscribe error:", error);
            return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
        }

        return NextResponse.json({ message: "You're signed up! You'll receive alerts once approved." });
    } catch {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
