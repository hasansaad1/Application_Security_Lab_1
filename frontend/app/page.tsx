import { redirect } from "next/navigation";

import { Navbar } from "@/components/common/Navbar";
import { ListingCard } from "@/components/listings/ListingCard";
import { verifySession } from "@/lib/session";
import { getListings } from "@/lib/listings";

export default async function HomePage() {
    const user = await verifySession();

    if (!user) {
        redirect("/login?from=/");
    }

    const listings = await getListings();

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar user={user as { id?: string; username?: string; email?: string; profilePictureUrl?: string }} />
            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Available Listings</h1>
                        <p className="mt-2 text-gray-600">
                            {listings.length === 0
                                ? "No listings available at the moment"
                                : `Browse ${listings.length} ${listings.length === 1 ? "listing" : "listings"}`}
                        </p>
                    </div>

                    {/* Listings Grid */}
                    {listings.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                            {listings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
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
                                Check back later for new apartment listings.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
