import { redirect } from "next/navigation";

import { Navbar } from "@/components/common/Navbar";
import { FavoritesContent } from "@/components/listings/FavoritesContent";
import { verifySession } from "@/lib/session";

export default async function FavoritesPage() {
    const user = await verifySession();

    if (!user) {
        redirect("/login?from=/favorites");
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar user={user as { id?: string; username?: string; email?: string; profilePictureUrl?: string }} />
            <main className="flex-1">
                <FavoritesContent userId={user.id} />
            </main>
        </div>
    );
}

