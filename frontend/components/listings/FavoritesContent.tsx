"use client";

import { useEffect, useState } from "react";
import { HeartIcon } from "@heroicons/react/24/solid";
import { Listing } from "@/lib/listings";
import { ListingCard } from "./ListingCard";
import { getFavoriteListings } from "@/lib/favorites";

type FavoritesContentProps = {
    userId: string;
};

export function FavoritesContent({ userId }: FavoritesContentProps) {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const data = await getFavoriteListings();
            setListings(data);
        } catch (err) {
            console.error("Error fetching favorites:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleFavoriteRemoved = () => {
        // Refresh the list when a favorite is removed
        fetchFavorites();
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading your favorites...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <HeartIcon className="h-8 w-8 text-rose-400" />
                    <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
                </div>
                <p className="mt-2 text-gray-600">
                    {listings.length === 0
                        ? "You haven't favorited any listings yet"
                        : `You have ${listings.length} favorite ${listings.length === 1 ? "listing" : "listings"}`}
                </p>
            </div>

            {/* Listings Grid - 3 per row */}
            {listings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} userId={userId} onFavoriteRemoved={handleFavoriteRemoved} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-rose-50 p-6 mb-4">
                        <HeartIcon className="h-12 w-12 text-rose-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No favorites yet
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                        Start favoriting listings you're interested in by clicking the heart icon on any listing.
                    </p>
                </div>
            )}
        </div>
    );
}

