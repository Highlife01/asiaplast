"use client";

import { useState } from "react";
import { MESSAGE_STATUSES } from "@/lib/config";

export default function StatusSelect({
    action,
    current
}: {
    action: string;
    current: string;
}) {
    const [status, setStatus] = useState(current);
    const [state, setState] = useState<"idle" | "saving" | "ok" | "err">("idle");

    async function onChange(next: string) {
        setStatus(next);
        setState("saving");
        try {
            const res = await fetch(action, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: next })
            });
            setState(res.ok ? "ok" : "err");
        } catch {
            setState("err");
        }
    }

    return (
        <label className="flex items-center gap-2 text-xs">
            <select
                className="input !py-1.5 !text-xs"
                value={status}
                disabled={state === "saving"}
                onChange={(e) => onChange(e.target.value)}
            >
                {MESSAGE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                        {s}
                    </option>
                ))}
            </select>
            {state === "ok" ? <span className="text-brand-green-dark">Saved</span> : null}
            {state === "err" ? <span className="text-red-600">Failed</span> : null}
        </label>
    );
}
