import { redirect } from "next/navigation";

import { Navbar } from "@/components/common/Navbar";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { verifySession } from "@/lib/session";

export default async function ProfilePage() {
    const user = await verifySession();

    if (!user) {
        redirect("/login?from=/profile");
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50/20 via-rose-50/5 to-rose-50/10">
            <Navbar user={user as { id?: string; username?: string; email?: string; profilePictureUrl?: string }} />
            <main className="flex-1">
                <ProfileContent user={user} />
            </main>
        </div>
    );
}


