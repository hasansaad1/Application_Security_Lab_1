"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    MapPinIcon,
    CurrencyDollarIcon,
    HeartIcon,
    CalendarIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Listing } from "@/lib/listings";
import { checkFavoriteStatus, addToFavorites, removeFromFavorites } from "@/lib/favorites";

type ListingDetailContentProps = {
    listing: Listing;
    userId: string;
};

export function ListingDetailContent({ listing, userId }: ListingDetailContentProps) {
    const router = useRouter();
    const [isFavorited, setIsFavorited] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Check favorite status on mount
    useEffect(() => {
        if (userId) {
            checkFavoriteStatus(listing.id).then(setIsFavorited);
        }
    }, [listing.id, userId]);

    const handleFavoriteToggle = async () => {
        if (!userId || isToggling) {
            return;
        }

        setIsToggling(true);
        try {
            if (isFavorited) {
                const success = await removeFromFavorites(listing.id);
                if (success) {
                    setIsFavorited(false);
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

    const getImageUrl = (imagePath: string) => {
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }
        return `https://localhost/api/uploads/${imagePath}`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: Date | string) => {
        const d = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(d);
    };

    const formatAddress = () => {
        const parts = [
            listing.address_line1,
            listing.address_line2,
            listing.address_city,
            listing.address_province,
            listing.address_country,
            listing.address_zip_code,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "Address not specified";
    };

    const images = listing.images || [];
    const mainImage = images.length > 0 ? getImageUrl(images[currentImageIndex].path) : null;

    return (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="mb-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
                ← Back to listings
            </button>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                {/* Desktop: Two-column layout, Mobile: Stacked */}
                <div className="lg:flex lg:flex-row">
                    {/* Left Column: Images */}
                    <div className="lg:w-1/2 lg:border-r lg:border-gray-200 flex flex-col items-center">
                        {/* Main Image */}
                        <div className="relative w-full max-w-md mx-auto">
                            <div className="aspect-[4/3] lg:aspect-[3/2] bg-gray-100 overflow-hidden max-h-[350px]">
                                {mainImage ? (
                                    <img
                                        src={mainImage}
                                        alt={listing.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                        <span className="text-gray-400 text-lg">No image available</span>
                                    </div>
                                )}
                            </div>

                    {/* Image Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() =>
                                    setCurrentImageIndex(
                                        (prev) => (prev - 1 + images.length) % images.length
                                    )
                                }
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors shadow-lg"
                                aria-label="Previous image"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-700"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={() =>
                                    setCurrentImageIndex((prev) => (prev + 1) % images.length)
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors shadow-lg"
                                aria-label="Next image"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-700"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`h-2 rounded-full transition-all ${
                                            index === currentImageIndex
                                                ? "w-8 bg-white"
                                                : "w-2 bg-white/50"
                                        }`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Favorite Button */}
                    {userId && (
                        <button
                            type="button"
                            onClick={handleFavoriteToggle}
                            disabled={isToggling}
                            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        >
                            {isFavorited ? (
                                <HeartIconSolid className="h-5 w-5 text-rose-500" />
                            ) : (
                                <HeartIcon className="h-5 w-5 text-gray-600" />
                            )}
                        </button>
                    )}

                            {/* Availability Badge */}
                            {!listing.is_available && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                    Unavailable
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Grid - Desktop: Below main image, Mobile: Hidden */}
                        {images.length > 1 && (
                            <div className="hidden lg:grid grid-cols-4 gap-2 p-2 border-t border-gray-200 max-h-[100px] w-full max-w-md mx-auto">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                            index === currentImageIndex
                                                ? "border-indigo-500 ring-2 ring-indigo-200"
                                                : "border-gray-200 hover:border-indigo-300"
                                        }`}
                                    >
                                        <img
                                            src={getImageUrl(image.path)}
                                            alt={`${listing.title} - Image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:w-1/2">
                        <div className="p-3 lg:p-4">
                            {/* Header */}
                            <div className="mb-3">
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                                    {listing.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 text-gray-600 text-xs">
                                    <div className="flex items-center gap-1">
                                        <UserIcon className="h-3.5 w-3.5" />
                                        <span>{listing.owner_username || "Unknown"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-3.5 w-3.5" />
                                        <span>{formatDate(listing.publication_date)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Price - Prominent */}
                            <div className="mb-4 p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                                <div className="flex items-center gap-2">
                                    <CurrencyDollarIcon className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-indigo-700 font-medium mb-0.5">
                                            Monthly Rent
                                        </div>
                                        <div className="text-2xl font-bold text-indigo-900">
                                            {formatPrice(listing.price)}
                                            <span className="text-base font-normal text-indigo-600 ml-1">
                                                /month
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {listing.description && (
                                <div className="mb-4">
                                    <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                                        Description
                                    </h2>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                        {listing.description}
                                    </p>
                                </div>
                            )}

                            {/* Location */}
                            <div className="mb-4">
                                <h2 className="text-base font-semibold text-gray-900 mb-1.5">Location</h2>
                                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                    <MapPinIcon className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-700 leading-relaxed text-sm">{formatAddress()}</p>
                                </div>
                            </div>

                            {/* Additional Images Grid - Mobile only */}
                            {images.length > 1 && (
                                <div className="lg:hidden mt-4">
                                    <h2 className="text-base font-semibold text-gray-900 mb-2">
                                        More Photos ({images.length})
                                    </h2>
                                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                                        {images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                    index === currentImageIndex
                                                        ? "border-indigo-500 ring-2 ring-indigo-200"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <img
                                                    src={getImageUrl(image.path)}
                                                    alt={`${listing.title} - Image ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

