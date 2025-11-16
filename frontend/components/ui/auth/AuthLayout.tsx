import React from "react";

type AuthLayoutProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="m-auto w-full max-w-md px-6 py-12">
                <div className="bg-white shadow-lg rounded-2xl px-8 py-10">
                    <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                    {subtitle && (
                        <p className="mt-2 text-sm text-gray-500">
                            {subtitle}
                        </p>
                    )}
                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
