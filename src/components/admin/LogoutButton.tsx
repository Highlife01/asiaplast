"use client";

export default function LogoutButton() {
    async function onClick() {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
    }

    return (
        <button type="button" onClick={onClick} className="text-slate-300 hover:text-white">
            Sign out
        </button>
    );
}
