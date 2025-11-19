import React from "react";

type AuthLayoutProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 relative overflow-hidden">
            {/* Decorative background elements inspired by mobile app */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Abstract plant-like shapes */}
                <div className="absolute bottom-0 left-0 w-96 h-[500px] opacity-10">
                    <svg viewBox="0 0 300 400" className="w-full h-full">
                        {/* Large plant shape */}
                        <path d="M80 350 Q60 300 70 250 Q50 200 60 180 Q40 150 50 130 Q30 100 40 80 Q20 50 30 30 Q10 10 20 0 L20 400 Z" 
                              fill="rgba(0,0,0,0.3)" />
                        <path d="M100 350 Q90 300 100 250 Q85 200 95 180 Q80 150 90 130 Q75 100 85 80 Q70 50 80 30 Q65 10 75 0 L75 400 Z" 
                              fill="rgba(0,0,0,0.2)" />
                        {/* Decorative circles */}
                        <circle cx="50" cy="200" r="15" fill="rgba(251,113,133,0.15)" />
                        <circle cx="120" cy="280" r="12" fill="rgba(251,113,133,0.12)" />
                        <circle cx="30" cy="320" r="10" fill="rgba(0,0,0,0.1)" />
                    </svg>
                </div>
                
                {/* Right side decorative elements */}
                <div className="absolute top-0 right-0 w-80 h-96 opacity-8">
                    <svg viewBox="0 0 250 300" className="w-full h-full">
                        {/* Abstract red plant shape */}
                        <path d="M200 300 Q180 250 190 200 Q170 150 180 130 Q160 100 170 80 Q150 50 160 30 Q140 10 150 0 L150 300 Z" 
                              fill="rgba(251,113,133,0.2)" />
                        <path d="M220 300 Q210 250 220 200 Q200 150 210 130 Q190 100 200 80 Q180 50 190 30 Q170 10 180 0 L180 300 Z" 
                              fill="rgba(251,113,133,0.15)" />
                        {/* Decorative elements */}
                        <circle cx="190" cy="150" r="18" fill="rgba(251,113,133,0.18)" />
                        <circle cx="210" cy="220" r="14" fill="rgba(0,0,0,0.08)" />
                        <circle cx="230" cy="100" r="10" fill="rgba(251,113,133,0.12)" />
                    </svg>
                </div>
                
                {/* Subtle geometric patterns */}
                <div className="absolute top-1/4 left-1/3 w-40 h-40 opacity-5">
                    <div className="w-full h-full rounded-full border-4 border-rose-300/30"></div>
                </div>
                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 opacity-5">
                    <div className="w-full h-full rounded-full border-4 border-black/20"></div>
                </div>
                <div className="absolute top-1/2 right-1/5 w-24 h-24 opacity-4">
                    <div className="w-full h-full rounded-full border-3 border-rose-400/25"></div>
                </div>
            </div>
            
            <div className="m-auto w-full max-w-md px-6 py-12 relative z-10">
                <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl px-8 py-10 border border-rose-100/50">
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
