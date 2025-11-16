import { redirect } from "next/navigation";

import { Navbar } from "@/components/common/Navbar";
import { verifySession } from "@/lib/session";

export default async function HomePage() {
    const user = await verifySession();

    if (!user) {
        redirect("/login?from=/");
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar user={user} />
            <main className="flex-1">
                {/* Apartment listings main content will go here */}
            </main>
        </div>
    );
}
