"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
    HeartIcon,
    ChevronDownIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import { CreateListingModal } from "@/components/listings/CreateListingModal";

type User = {
    id?: string;
    username?: string;
    email?: string;
    profile_picture_path?: string;
};

type NavbarProps = {
    user: User;
};

export function Navbar({ user }: NavbarProps) {
    const router = useRouter();

    const [menuOpen, setMenuOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement | null>(null);

    const displayName = user.username;
    const profilePictureUrl = user.profile_picture_path
        ? `https://localhost/api/uploads/${user.profile_picture_path}`
        : "";

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }

        if (menuOpen) {
            window.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const handleSignOut = async () => {
        if (signingOut) {
            return
        };

        setSigningOut(true);
        try {
            const res = await fetch("https://localhost/api/auth/logout", {
                method: "POST",
            });

            if (!res.ok) {
                console.error("Failed to sign out");
            }

            router.replace("/login");
        } catch (err) {
            console.error("Error signing out", err);
            router.replace("/login");
        } finally {
            setSigningOut(false);
            setMenuOpen(false);
        }
    };

    return (
        <>
        <header className="sticky top-0 z-30 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl backdrop-blur-sm border-b-2 border-rose-500/20">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

                {/* Left */}
                <Link
                    href="/"
                    className="flex items-baseline gap-2 group"
                >
                    <span className="text-lg font-bold tracking-tight text-white group-hover:text-rose-300 transition-colors">
                        Homigo
                    </span>
                    <span className="hidden text-xs text-gray-300 sm:inline">
                        Find & share apartments
                    </span>
                </Link>

                {/* Right */}
                <div className="flex items-center gap-4">
                    {/* Create Listing Button */}
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 active:scale-95 transition-all shadow-lg shadow-rose-500/30 border-2 border-rose-400/50"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Create Listing</span>
                    </button>

                    {/* Favorites */}
                    <Link
                        href="/favorites"
                        aria-label="Favorite listings"
                        className="inline-flex items-center justify-center p-1.5 text-gray-300 hover:text-rose-400 hover:bg-gray-700/50 transition-colors rounded-xl"
                    >
                        <HeartIcon className="h-5 w-5" />
                    </Link>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((o) => !o)}
                            className="flex items-center gap-2 text-sm text-gray-200 hover:text-white"
                        >
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-xs font-medium text-white border-2 border-gray-600">
                                {profilePictureUrl ? (
                                    <img
                                        src={profilePictureUrl}
                                        alt={displayName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>{displayName?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <span className="hidden sm:inline max-w-[140px] truncate">
                                {displayName}
                            </span>
                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                        </button>

                        {/* Dropdown */}
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-44 border border-gray-200 bg-white shadow-lg shadow-black/10 z-20">
                                <div className="py-1 text-sm text-gray-900">
                                    <Link
                                        href="/my-listings"
                                        className="block px-3 py-2 hover:bg-rose-50 hover:text-rose-600 transition-colors font-medium"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        My listings
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="block px-3 py-2 hover:bg-rose-50 hover:text-rose-600 transition-colors font-medium"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                </div>
                                <div className="border-t border-gray-200 py-1">
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <span>Sign out</span>
                                        {signingOut && (
                                            <span className="text-[10px] text-rose-400">...</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
        
        {/* Create Listing Modal - rendered outside header for proper positioning */}
        {user.id && (
            <CreateListingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                userId={user.id}
                onSuccess={() => {
                    // Refresh the page to show the new listing
                    router.refresh();
                }}
            />
        )}
    </>
    );
}
