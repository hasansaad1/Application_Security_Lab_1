"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    LockClosedIcon,
    PhotoIcon,
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon,
} from "@heroicons/react/24/outline";


import PasswordStrength from "./PasswordStrength";
import {
    signupSchema,
    loginSchema,
    passwordSchema,
} from "@/lib/validations/auth";

type Mode = "login" | "register";

type AuthFormProps = {
    mode: Mode;
};

export function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const isRegister = mode === "register";

    const [formState, setFormState] = useState({
        username: "",
        email: "",
        password: "",
        phone_number: "",
    });

    const [confirmPassword, setConfirmPassword] = useState("");
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setProfilePictureFile(file);
    };

    const handleRemoveProfilePicture = () => {
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        if (!profilePictureFile) {
            setProfilePicturePreview(null);
            return;
        }
        const url = URL.createObjectURL(profilePictureFile);
        setProfilePicturePreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [profilePictureFile]);

    const passwordIsStrong = passwordSchema.safeParse(formState.password).success;
    const passwordsMatch = !isRegister || (confirmPassword.length > 0 && confirmPassword === formState.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            /* Validations */
            if (isRegister) {
                const parseResult = signupSchema.safeParse({
                    username: formState.username,
                    email: formState.email,
                    password: formState.password,
                    confirm_password: confirmPassword,
                    phone_number: formState.phone_number,
                });

                if (!parseResult.success) {
                    const firstError = parseResult.error.issues[0]?.message ?? "Invalid form data.";
                    setError(firstError);
                    return;
                }
            } else {
                const parseResult = loginSchema.safeParse({
                    email: formState.email,
                    password: formState.password,
                });

                if (!parseResult.success) {
                    const firstError = parseResult.error.issues[0]?.message ?? "Invalid login data.";
                    setError(firstError);
                    return;
                }
            }

            setLoading(true);

            /* API */
            if (isRegister) {
                const endpoint = `https://localhost/api/auth/register`;

                const formData = new FormData();
                formData.append("username", formState.username);
                formData.append("email", formState.email);
                formData.append("password", formState.password);
                formData.append("phone_number", formState.phone_number);
                formData.append("role", "tenant");

                if (profilePictureFile) {
                    // backend field name "avatar" – change if your API expects another name
                    formData.append("profile_picture", profilePictureFile);
                }

                const res = await fetch(endpoint, {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setError((data as any).error ?? "Signup failed.");
                    return;
                }

                router.push("/");
            } else {
                const endpoint = `https://localhost/api/auth/login`;

                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: formState.email,
                        password: formState.password,
                    }),
                    credentials: "include",
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setError((data as any).error ?? "Login failed.");
                    return;
                }

                const redirectTo = searchParams.get("from") ?? "/";
                router.replace(redirectTo);
            }
        } catch (err) {
            console.error(err);
            setError("Unexpected error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegister && (
                <>
                    {/* Profile picture */}
                    <div>
                        <div className="flex flex-col items-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {profilePicturePreview ? (
                                    <img
                                        src={profilePicturePreview}
                                        alt="Avatar preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400 text-xs">
                                        <PhotoIcon className="h-6 w-6 mb-1" />
                                        <span>Upload</span>
                                    </div>
                                )}
                            </button>

                            <input
                                ref={fileInputRef}
                                id="avatar"
                                name="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePictureChange}
                            />

                            {profilePicturePreview && (
                                <button
                                    type="button"
                                    onClick={handleRemoveProfilePicture}
                                    className="mt-2 inline-flex items-center text-xs text-gray-500 hover:text-red-500"
                                >
                                    <XMarkIcon className="h-3 w-3 mr-1" />
                                    Remove picture
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <div className="mt-1 relative rounded-lg shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={formState.username}
                                onChange={handleFormChange}
                                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Your username"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                >
                    Email address
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <EnvelopeIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formState.email}
                        onChange={handleFormChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="user@homigo.com"
                    />
                </div>
            </div>

            {/* Phone number */}
            {isRegister && (
                <div>
                    <label
                        htmlFor="phone_number"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Phone number
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <PhoneIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </div>
                        <input
                            id="phone_number"
                            name="phone_number"
                            type="tel"
                            autoComplete="tel"
                            required
                            value={formState.phone_number}
                            onChange={handleFormChange}
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="+34 111 111 111"
                        />
                    </div>
                </div>
            )}

            {/* Password */}
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >
                    Password
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LockClosedIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={isRegister ? "new-password" : "current-password"}
                        required
                        value={formState.password}
                        onChange={handleFormChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder={isRegister ? "Create a strong password" : "Your password"}
                    />
                    {/* Visibility toggle */}
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>
                </div>

                {/* Strength meter only on signup */}
                {isRegister && <PasswordStrength password={formState.password} />}
            </div>

            {/* Confirm password */}
            {isRegister && (
                <div>
                    <label
                        htmlFor="confirm_password"
                        className="block text-sm font-medium text-gray-700 mt-4"
                    >
                        Confirm password
                    </label>

                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockClosedIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </div>

                        <input
                            id="confirm_password"
                            name="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`block w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 ${confirmPassword.length === 0
                                ? "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                : confirmPassword === formState.password
                                    ? "border-green-400 focus:border-green-500 focus:ring-green-500"
                                    : "border-red-400 focus:border-red-500 focus:ring-red-500"
                                }`}
                            placeholder="Repeat your password"
                        />

                        {/* Visibility toggle */}
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? (
                                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                                <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                        </button>
                    </div>

                    {confirmPassword.length > 0 &&
                        confirmPassword !== formState.password && (
                            <p className="mt-1 text-xs text-red-500">
                                Passwords do not match.
                            </p>
                        )}
                </div>
            )}


            {error && (
                <p className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading || (!passwordIsStrong || !passwordsMatch)}
                className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading
                    ? "Please wait..."
                    : isRegister
                        ? "Create account"
                        : "Log in"}
            </button>
        </form>
    );
}
