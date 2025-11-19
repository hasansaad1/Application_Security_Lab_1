import { Listing } from "./listings";

export async function checkFavoriteStatus(listingId: number): Promise<boolean> {
    try {
        const res = await fetch(`https://localhost/api/listings/${listingId}/favorite`, {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) {
            return false;
        }

        const data = await res.json();
        return data.favorited || false;
    } catch (err) {
        console.error("Error checking favorite status:", err);
        return false;
    }
}

export async function addToFavorites(listingId: number): Promise<boolean> {
    try {
        const res = await fetch(`https://localhost/api/listings/${listingId}/favorite`, {
            method: "POST",
            credentials: "include",
        });

        return res.ok;
    } catch (err) {
        console.error("Error adding to favorites:", err);
        return false;
    }
}

export async function removeFromFavorites(listingId: number): Promise<boolean> {
    try {
        const res = await fetch(`https://localhost/api/listings/${listingId}/favorite`, {
            method: "DELETE",
            credentials: "include",
        });

        return res.ok;
    } catch (err) {
        console.error("Error removing from favorites:", err);
        return false;
    }
}

export async function getFavoriteListings(): Promise<Listing[]> {
    try {
        const res = await fetch("https://localhost/api/listings/favorites", {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error fetching favorite listings:", err);
        return [];
    }
}
