import { redirect } from "next/navigation";

import { Navbar } from "@/components/common/Navbar";
import { MyListingsContent } from "@/components/listings/MyListingsContent";
import { verifySession } from "@/lib/session";

export default async function MyListingsPage() {
    const user = await verifySession();

    if (!user) {
        redirect("/login?from=/my-listings");
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar user={user as { id?: string; username?: string; email?: string; profilePictureUrl?: string }} />
            <main className="flex-1">
                <MyListingsContent />
            </main>
        </div>
    );
}

