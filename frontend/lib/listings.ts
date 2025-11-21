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

export type PaginatedListings = {
    listings: Listing[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export async function getListings(page?: number, limit?: number): Promise<PaginatedListings> {
    const cookieStore = await cookies();

    // Build "Cookie" header manually
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join("; ");

    // Build query string
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append("page", page.toString());
    if (limit !== undefined) queryParams.append("limit", limit.toString());
    const queryString = queryParams.toString();
    const url = `http://backend:8080/listings${queryString ? `?${queryString}` : ""}`;

    let res: Response;
    try {
        res = await fetch(url, {
            method: "GET",
            headers: {
                cookie: cookieHeader,
                accept: "application/json",
            },
            cache: "no-store",
        });
    } catch (err) {
        console.error("[getListings] fetch to listings backend failed:", err);
        return { listings: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }

    if (!res.ok) {
        console.error("[getListings] /api/listings returned", res.status);
        return { listings: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }

    const data = await res.json();
    return data;
}

export async function getMyListings(): Promise<Listing[]> {
    const cookieStore = await cookies();

    // Build "Cookie" header manually
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join("; ");

    let res: Response;
    try {
        res = await fetch(`http://backend:8080/listings/my`, {
            method: "GET",
            headers: {
                cookie: cookieHeader,
                accept: "application/json",
            },
            cache: "no-store",
        });
    } catch (err) {
        console.error("[getMyListings] fetch to listings backend failed:", err);
        return [];
    }

    if (!res.ok) {
        console.error("[getMyListings] /api/listings/my returned", res.status);
        return [];
    }

    const listings = await res.json();
    return listings;
}

export async function getListingById(id: number): Promise<Listing | null> {
    const cookieStore = await cookies();

    // Build "Cookie" header manually
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join("; ");

    let res: Response;
    try {
        res = await fetch(`http://backend:8080/listings/${id}`, {
            method: "GET",
            headers: {
                cookie: cookieHeader,
                accept: "application/json",
            },
            cache: "no-store",
        });
    } catch (err) {
        console.error("[getListingById] fetch to listings backend failed:", err);
        return null;
    }

    if (!res.ok) {
        if (res.status === 404) {
            return null;
        }
        console.error("[getListingById] /api/listings/:id returned", res.status);
        return null;
    }

    const listing = await res.json();
    return listing;
}

