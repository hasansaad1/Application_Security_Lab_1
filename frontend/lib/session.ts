import { cookies } from "next/headers";

export type SessionUser = {
    id: string;
    username?: string;
    email?: string;
    profilePictureUrl?: string;
};

export async function verifySession(): Promise<SessionUser | null> {
    const cookieStore = await cookies();

    // Build "Cookie" header manually
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join("; ");

    let res: Response;
    try {
        res = await fetch(`http://backend:8080/auth/me`, {
            method: "GET",
            headers: {
                cookie: cookieHeader,
                accept: "application/json",
            },
            // External fetch, so cookies aren’t passed automatically
            cache: "no-store",
        });
    } catch (err) {
        console.error("[verifySession] fetch to auth backend failed:", err);
        return null;
    }

    if (res.status === 401 || res.status === 403 || res.status === 404) {
        return null;
    };
    if (!res.ok) {
        console.error("[verifySession] /api/auth/me returned", res.status);
        throw new Error("Failed to fetch user session.");
    };

    const user = (await res.json()).data.user;
    return user;
}