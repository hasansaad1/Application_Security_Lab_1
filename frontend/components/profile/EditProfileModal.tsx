"use client";

import { useState, useRef, useEffect } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { SessionUser } from "@/lib/session";

type EditProfileModalProps = {
    isOpen: boolean;
    onClose: () => void;
    user: SessionUser;
    onSuccess: (updatedUser: SessionUser) => void;
};

type FormData = {
    username: string;
    email: string;
    phone_number: string;
};

type FormErrors = {
    [key: string]: string;
};

export function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
    const [formData, setFormData] = useState<FormData>({
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
    });

    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const getImageUrl = (imagePath: string | undefined) => {
        if (!imagePath) return "";
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `https://localhost/api/uploads/${imagePath}`;
    };

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                phone_number: user.phone_number || "",
            });
            const currentImageUrl = getImageUrl(user.profile_picture_path);
            setProfilePicturePreview(currentImageUrl);
        }
    }, [user]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setProfilePictureFile(null);
            const currentImageUrl = getImageUrl(user.profile_picture_path);
            setProfilePicturePreview(currentImageUrl);
            setErrors({});
        }
    }, [isOpen, user]);

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Handle click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setErrors((prev) => ({
                    ...prev,
                    profile_picture: "Please select an image file",
                }));
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    profile_picture: "Image must be less than 5MB",
                }));
                return;
            }

            setProfilePictureFile(file);
            setProfilePicturePreview(URL.createObjectURL(file));

            // Clear error
            if (errors.profile_picture) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.profile_picture;
                    return newErrors;
                });
            }
        }
    };

    const handleRemovePicture = () => {
        setProfilePictureFile(null);
        setProfilePicturePreview(getImageUrl(user.profile_picture_path));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Validate username
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3 || formData.username.length > 50) {
            newErrors.username = "Username must be between 3 and 50 characters";
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
            newErrors.username = "Username can only contain letters, numbers, underscores, and hyphens";
        }

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Validate phone number
        if (!formData.phone_number.trim()) {
            newErrors.phone_number = "Phone number is required";
        } else {
            const cleaned = formData.phone_number.replace(/[\s\-\(\)\+\.]/g, "");
            if (!/^\d{7,20}$/.test(cleaned)) {
                newErrors.phone_number = "Phone number must contain 7-20 digits";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("username", formData.username.trim());
            formDataToSend.append("email", formData.email.trim().toLowerCase());
            formDataToSend.append("phone_number", formData.phone_number.trim());

            if (profilePictureFile) {
                formDataToSend.append("profile_picture", profilePictureFile);
            }

            const res = await fetch("https://localhost/api/users/me", {
                method: "PUT",
                credentials: "include",
                body: formDataToSend,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to update profile");
            }

            const data = await res.json();
            onSuccess(data.data.user);
            onClose();
        } catch (err) {
            console.error("Error updating profile:", err);
            setErrors({
                submit: err instanceof Error ? err.message : "Failed to update profile. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Profile Picture */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Picture
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center border-4 border-rose-300">
                                    {profilePicturePreview ? (
                                        <img
                                            src={profilePicturePreview}
                                            alt="Profile preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <PhotoIcon className="h-12 w-12 text-white" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="profile-picture-input"
                                    disabled={isSubmitting}
                                />
                                <div className="flex gap-2">
                                    <label
                                        htmlFor="profile-picture-input"
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <PhotoIcon className="h-4 w-4" />
                                        {profilePictureFile ? "Change Picture" : "Upload Picture"}
                                    </label>
                                    {profilePicturePreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePicture}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            disabled={isSubmitting}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                {errors.profile_picture && (
                                    <p className="text-sm text-red-600">{errors.profile_picture}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    JPG or PNG, max 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username *
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                                errors.username ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Enter your username"
                            disabled={isSubmitting}
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                                errors.email ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Enter your email"
                            disabled={isSubmitting}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                                errors.phone_number ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Enter your phone number"
                            disabled={isSubmitting}
                        />
                        {errors.phone_number && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                        )}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


