"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Listing } from "@/lib/listings";
import { EditListingModal } from "./EditListingModal";

export function MyListingsContent() {
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await fetch("https://localhost/api/listings/my", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch listings");
            }

            const data = await res.json();
            setListings(data);
        } catch (err) {
            console.error("Error fetching listings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
            return;
        }

        setDeletingId(id);
        try {
            const res = await fetch(`https://localhost/api/listings/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to delete listing");
            }

            // Remove from list
            setListings((prev) => prev.filter((listing) => listing.id !== id));
        } catch (err) {
            console.error("Error deleting listing:", err);
            alert(err instanceof Error ? err.message : "Failed to delete listing. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleEditSuccess = () => {
        fetchListings();
        setEditingListing(null);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatLocation = (listing: Listing) => {
        const parts = [
            listing.address_city,
            listing.address_province,
            listing.address_country,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "Location not specified";
    };

    const getImageUrl = (imagePath: string) => {
        // If path already includes http/https, use as-is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // Otherwise, prepend the API base URL
        return `https://localhost/api/uploads/${imagePath}`;
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading your listings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
                <p className="mt-2 text-gray-600">
                    {listings.length === 0
                        ? "You haven't created any listings yet"
                        : `You have ${listings.length} ${listings.length === 1 ? "listing" : "listings"}`}
                </p>
            </div>

            {/* Listings Grid */}
            {listings.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {listings.map((listing) => (
                        <div
                            key={listing.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                {listing.images && listing.images.length > 0 ? (
                                    <img
                                        src={getImageUrl(listing.images[0].path)}
                                        alt={listing.title}
                                        className="w-full h-full object-cover"
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
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                                    {listing.title}
                                </h3>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                                    {listing.description || "No description available"}
                                </p>

                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                                    <span className="line-clamp-1">{formatLocation(listing)}</span>
                                </div>

                                <div className="text-lg font-bold text-rose-600 mb-4">
                                    {formatPrice(listing.price)}/month
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setEditingListing(listing)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(listing.id)}
                                        disabled={deletingId === listing.id}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        {deletingId === listing.id ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-gray-100 p-6 mb-4">
                        <svg
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No listings found
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                        Create your first listing to get started.
                    </p>
                </div>
            )}

            {/* Edit Modal */}
            {editingListing && (
                <EditListingModal
                    isOpen={true}
                    onClose={() => setEditingListing(null)}
                    listing={editingListing}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
}
