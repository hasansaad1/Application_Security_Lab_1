"use client";

import { useEffect, useState } from "react";
import { UserIcon, EnvelopeIcon, HeartIcon, HomeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Listing } from "@/lib/listings";
import { ListingCard } from "@/components/listings/ListingCard";
import { getFavoriteListings } from "@/lib/favorites";
import { SessionUser } from "@/lib/session";
import { EditProfileModal } from "./EditProfileModal";
import { useRouter } from "next/navigation";

type ProfileContentProps = {
    user: SessionUser;
};

export function ProfileContent({ user: initialUser }: ProfileContentProps) {
    const router = useRouter();
    const [user, setUser] = useState<SessionUser>(initialUser);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [favorites, setFavorites] = useState<Listing[]>([]);
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [loadingListings, setLoadingListings] = useState(true);

    const profilePictureUrl = user.profile_picture_path
        ? `https://localhost/api/uploads/${user.profile_picture_path}`
        : "";

    const fetchFavorites = async () => {
        setLoadingFavorites(true);
        try {
            const data = await getFavoriteListings();
            setFavorites(data);
        } catch (err) {
            console.error("Error fetching favorites:", err);
        } finally {
            setLoadingFavorites(false);
        }
    };

    const fetchMyListings = async () => {
        setLoadingListings(true);
        try {
            const res = await fetch("https://localhost/api/listings/my", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch listings");
            }

            const data = await res.json();
            setMyListings(data);
        } catch (err) {
            console.error("Error fetching listings:", err);
        } finally {
            setLoadingListings(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
        fetchMyListings();
    }, []);

    const handleFavoriteRemoved = () => {
        fetchFavorites();
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* User Info Section */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-rose-100/50 p-6 sm:p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center border-4 border-rose-300 shadow-lg">
                            {profilePictureUrl ? (
                                <img
                                    src={profilePictureUrl}
                                    alt={user.username || "Profile"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-16 w-16 text-white" />
                            )}
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {user.username || "User"}
                            </h1>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                                title="Edit Profile"
                            >
                                <PencilIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Edit</span>
                            </button>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                                <EnvelopeIcon className="h-5 w-5 text-rose-500" />
                                <span className="text-sm sm:text-base">{user.email || "No email provided"}</span>
                            </div>
                            
                            {user.phone_number && (
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm sm:text-base">
                                    <span className="font-medium">Phone:</span>
                                    <span>{user.phone_number}</span>
                                </div>
                            )}
                            
                            {user.id && (
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-sm">
                                    <span className="font-medium">User ID:</span>
                                    <span>{user.id}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    onSuccess={(updatedUser) => {
                        setUser(updatedUser);
                        router.refresh(); // Refresh to get updated data from server
                    }}
                />
            )}

            {/* Favorites Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <HeartIcon className="h-7 w-7 text-rose-500" />
                    <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
                    <span className="text-sm text-gray-500 bg-rose-50 px-3 py-1 rounded-full">
                        {favorites.length}
                    </span>
                </div>

                {loadingFavorites ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                        <div className="text-gray-500">Loading favorites...</div>
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {favorites.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                userId={user.id}
                                onFavoriteRemoved={handleFavoriteRemoved}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-gray-200">
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

            {/* My Listings Section */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <HomeIcon className="h-7 w-7 text-rose-500" />
                    <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
                    <span className="text-sm text-gray-500 bg-rose-50 px-3 py-1 rounded-full">
                        {myListings.length}
                    </span>
                </div>

                {loadingListings ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                        <div className="text-gray-500">Loading your listings...</div>
                    </div>
                ) : myListings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {myListings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                userId={user.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-gray-200">
                        <div className="rounded-full bg-gray-100 p-6 mb-4">
                            <HomeIcon className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No listings found
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            Create your first listing to get started.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

