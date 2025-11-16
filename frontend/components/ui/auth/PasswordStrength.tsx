// components/PasswordStrength/index.tsx
"use client";

import React from "react";
import { getPasswordRuleFlags } from "@/lib/validations/auth";

type Props = {
    password: string;
};

export default function PasswordStrength({ password }: Props) {
    const rules = getPasswordRuleFlags(password);
    const passed = Object.values(rules).filter(Boolean).length;
    const percent = passed * 20;

    return (
        <div className="mt-3 space-y-3">
            <ul className="text-xs space-y-1">
                <Rule ok={rules.length}>At least 8 characters</Rule>
                <Rule ok={rules.upper}>At least 1 uppercase letter</Rule>
                <Rule ok={rules.lower}>At least 1 lowercase letter</Rule>
                <Rule ok={rules.number}>At least 1 number</Rule>
                <Rule ok={rules.special}>At least 1 special character</Rule>
            </ul>

            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full transition-all"
                    style={{
                        width: `${percent}%`,
                        background:
                            passed < 3 ? "#f87171" : passed < 5 ? "#fbbf24" : "#34d399",
                    }}
                />
            </div>
        </div>
    );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
    return (
        <li className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-gray-500"}`}>
            <span className={`h-2 w-2 rounded-full ${ok ? "bg-green-400" : "bg-gray-300"}`} />
            {children}
        </li>
    );
}
