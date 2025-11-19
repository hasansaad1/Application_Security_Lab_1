"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPinIcon, CurrencyDollarIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { checkFavoriteStatus, addToFavorites, removeFromFavorites } from "@/lib/favorites";

type Listing = {
    id: number;
    title: string;
    description: string | null;
    price: number;
    address_city: string | null;
    address_province: string | null;
    address_country: string | null;
    is_available: boolean;
    images?: Array<{ path: string }>;
};

type ListingCardProps = {
    listing: Listing;
    userId?: string;
    onFavoriteRemoved?: () => void;
};

export function ListingCard({ listing, userId, onFavoriteRemoved }: ListingCardProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    // Check favorite status on mount
    useEffect(() => {
        if (userId) {
            checkFavoriteStatus(listing.id).then(setIsFavorited);
        }
    }, [listing.id, userId]);

    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId || isToggling) {
            return;
        }

        setIsToggling(true);
        try {
            if (isFavorited) {
                const success = await removeFromFavorites(listing.id);
                if (success) {
                    setIsFavorited(false);
                    // Notify parent if on favorites page
                    if (onFavoriteRemoved) {
                        onFavoriteRemoved();
                    }
                }
            } else {
                const success = await addToFavorites(listing.id);
                if (success) {
                    setIsFavorited(true);
                }
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        } finally {
            setIsToggling(false);
        }
    };
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatLocation = () => {
        const parts = [
            listing.address_city,
            listing.address_province,
            listing.address_country,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "Location not specified";
    };

    const truncateDescription = (text: string | null, maxLength: number = 120) => {
        if (!text) return "No description available";
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const getImageUrl = (imagePath: string) => {
        // If path already includes http/https, use as-is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // Otherwise, prepend the API base URL
        return `https://localhost/api/uploads/${imagePath}`;
    };

    const mainImage = listing.images && listing.images.length > 0 
        ? getImageUrl(listing.images[0].path)
        : null;

    return (
        <Link
            href={`/listings/${listing.id}`}
            className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-rose-100/40 active:scale-[0.98] hover:border-rose-200/60 hover:shadow-rose-200/20"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 overflow-hidden">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
                        <span className="text-rose-300 text-sm font-medium">No image</span>
                    </div>
                )}
                {!listing.is_available && (
                    <div className="absolute top-3 right-3 bg-gray-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg">
                        Unavailable
                    </div>
                )}
                {/* Favorite Icon */}
                {userId && (
                    <button
                        type="button"
                        onClick={handleFavoriteToggle}
                        disabled={isToggling}
                        className="absolute top-3 left-3 p-2.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-90 border-2 border-rose-200/50"
                        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    >
                        {isFavorited ? (
                            <HeartIconSolid className="h-5 w-5 text-rose-500" />
                        ) : (
                            <HeartIcon className="h-5 w-5 text-gray-500" />
                        )}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3 bg-gradient-to-b from-white via-rose-50/20 to-white">
                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                    {listing.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {truncateDescription(listing.description)}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="line-clamp-1">{formatLocation()}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 pt-2 border-t-2 border-rose-100">
                    <span className="text-xl font-bold text-gray-900">{formatPrice(listing.price)}</span>
                    <span className="text-xs font-normal text-gray-500">/month</span>
                </div>
            </div>
        </Link>
    );
}

