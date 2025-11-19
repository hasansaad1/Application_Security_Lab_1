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
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-gray-400 text-sm">No image</span>
                    </div>
                )}
                {!listing.is_available && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        Unavailable
                    </div>
                )}
                {/* Favorite Icon */}
                {userId && (
                    <button
                        type="button"
                        onClick={handleFavoriteToggle}
                        disabled={isToggling}
                        className="absolute top-3 left-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    >
                        {isFavorited ? (
                            <HeartIconSolid className="h-5 w-5 text-rose-500" />
                        ) : (
                            <HeartIcon className="h-5 w-5 text-gray-600" />
                        )}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
                    {listing.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                    {truncateDescription(listing.description)}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{formatLocation()}</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-1 text-lg font-bold text-indigo-600">
                    <CurrencyDollarIcon className="h-5 w-5" />
                    <span>{formatPrice(listing.price)}</span>
                    <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
            </div>
        </Link>
    );
}

