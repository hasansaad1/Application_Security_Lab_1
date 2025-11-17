import { cookies } from "next/headers";

export type Listing = {
    id: number;
    owner_id: number;
    title: string;
    description: string | null;
    price: number;
    address_country: string | null;
    address_province: string | null;
    address_city: string | null;
    address_zip_code: string | null;
    address_line1: string | null;
    address_line2: string | null;
    is_available: boolean;
    publication_date: Date | string;
    owner_username?: string;
    images?: Array<{ path: string }>;
};

export async function getListings(): Promise<Listing[]> {
    const cookieStore = await cookies();

    // Build "Cookie" header manually
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join("; ");

    let res: Response;
    try {
        res = await fetch(`http://backend:8080/listings`, {
            method: "GET",
            headers: {
                cookie: cookieHeader,
                accept: "application/json",
            },
            cache: "no-store",
        });
    } catch (err) {
        console.error("[getListings] fetch to listings backend failed:", err);
        return [];
    }

    if (!res.ok) {
        console.error("[getListings] /api/listings returned", res.status);
        return [];
    }

    const listings = await res.json();
    return listings;
}

