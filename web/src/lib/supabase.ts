import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_UNIT_PHOTOS = "unit-photos";
export const BUCKET_PAYMENT_PROOFS = "payment-proofs";
export const BUCKET_RECEIPTS = "receipts";
