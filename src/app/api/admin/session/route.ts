import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getSession();
    if (!session || !session.admin) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
        authenticated: true,
        uid: session.uid,
        email: session.email,
        displayName: session.displayName,
        roles: session.roles
    });
}
