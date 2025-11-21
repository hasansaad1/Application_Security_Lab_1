import { redirect, notFound } from "next/navigation";

import { Navbar } from "@/components/common/Navbar";
import { ListingDetailContent } from "@/components/listings/ListingDetailContent";
import { verifySession } from "@/lib/session";
import { getListingById } from "@/lib/listings";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: PageProps) {
    const user = await verifySession();

    if (!user) {
        redirect("/login?from=/listings");
    }

    const { id } = await params;
    const listingId = parseInt(id, 10);

    if (isNaN(listingId)) {
        notFound();
    }

    const listing = await getListingById(listingId);

    if (!listing) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar user={user as { id?: string; username?: string; email?: string; profilePictureUrl?: string }} />
            <main className="flex-1">
                <ListingDetailContent listing={listing} userId={user.id} />
            </main>
        </div>
    );
}

