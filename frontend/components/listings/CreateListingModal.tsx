"use client";

import { useState, useRef, useEffect } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";

type CreateListingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess: () => void;
};

type FormData = {
    title: string;
    description: string;
    price: string;
    address_country: string;
    address_province: string;
    address_city: string;
    address_zip_code: string;
    address_line1: string;
    address_line2: string;
    is_available: boolean;
};

type FormErrors = {
    [key: string]: string;
};

export function CreateListingModal({ isOpen, onClose, userId, onSuccess }: CreateListingModalProps) {
    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        price: "",
        address_country: "",
        address_province: "",
        address_city: "",
        address_zip_code: "",
        address_line1: "",
        address_line2: "",
        is_available: true,
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                title: "",
                description: "",
                price: "",
                address_country: "",
                address_province: "",
                address_city: "",
                address_zip_code: "",
                address_line1: "",
                address_line2: "",
                is_available: true,
            });
            setImageFiles([]);
            setImagePreviews([]);
            setErrors({});
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isSubmitting, onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            // Limit to 10 images
            const filesToAdd = files.slice(0, 10 - imageFiles.length);
            setImageFiles((prev) => [...prev, ...filesToAdd]);
            
            // Create previews for new files
            filesToAdd.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews((prev) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
        // Reset the input value so the same files can be selected again if needed
        // This also allows selecting more files after the first selection
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        if (!formData.price.trim()) {
            newErrors.price = "Price is required";
        } else {
            const priceNum = parseFloat(formData.price);
            if (isNaN(priceNum) || priceNum <= 0) {
                newErrors.price = "Price must be a positive number";
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
            // Create FormData for multipart/form-data upload
            const formDataToSend = new FormData();
            formDataToSend.append("owner_id", userId);
            formDataToSend.append("title", formData.title.trim());
            if (formData.description.trim()) {
                formDataToSend.append("description", formData.description.trim());
            }
            formDataToSend.append("price", formData.price);
            if (formData.address_country.trim()) {
                formDataToSend.append("address_country", formData.address_country.trim());
            }
            if (formData.address_province.trim()) {
                formDataToSend.append("address_province", formData.address_province.trim());
            }
            if (formData.address_city.trim()) {
                formDataToSend.append("address_city", formData.address_city.trim());
            }
            if (formData.address_zip_code.trim()) {
                formDataToSend.append("address_zip_code", formData.address_zip_code.trim());
            }
            if (formData.address_line1.trim()) {
                formDataToSend.append("address_line1", formData.address_line1.trim());
            }
            if (formData.address_line2.trim()) {
                formDataToSend.append("address_line2", formData.address_line2.trim());
            }
            formDataToSend.append("is_available", formData.is_available.toString());

            // Append images
            imageFiles.forEach((file) => {
                formDataToSend.append("images", file);
            });

            const res = await fetch("https://localhost/api/listings", {
                method: "POST",
                credentials: "include",
                body: formDataToSend, // Don't set Content-Type header - browser will set it with boundary
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to create listing");
            }

            // Success - close modal and refresh listings
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error creating listing:", err);
            setErrors({
                submit: err instanceof Error ? err.message : "Failed to create listing. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={handleBackdropClick}
        >
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Listing</h2>
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
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.title ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="e.g., Cozy Downtown Apartment"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Describe your property..."
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price (per month) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.price ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="1200.00"
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Address</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="address_country" className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    id="address_country"
                                    name="address_country"
                                    value={formData.address_country}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="USA"
                                />
                            </div>

                            <div>
                                <label htmlFor="address_province" className="block text-sm font-medium text-gray-700 mb-1">
                                    Province/State
                                </label>
                                <input
                                    type="text"
                                    id="address_province"
                                    name="address_province"
                                    value={formData.address_province}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="California"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="address_city" className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="address_city"
                                    name="address_city"
                                    value={formData.address_city}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Los Angeles"
                                />
                            </div>

                            <div>
                                <label htmlFor="address_zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                                    ZIP Code
                                </label>
                                <input
                                    type="text"
                                    id="address_zip_code"
                                    name="address_zip_code"
                                    value={formData.address_zip_code}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="90001"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">
                                Street Address
                            </label>
                            <input
                                type="text"
                                id="address_line1"
                                name="address_line1"
                                value={formData.address_line1}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="123 Main St"
                            />
                        </div>

                        <div>
                            <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">
                                Apartment/Unit (optional)
                            </label>
                            <input
                                type="text"
                                id="address_line2"
                                name="address_line2"
                                value={formData.address_line2}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Apt 4B"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Property Images (optional, up to 10)
                        </label>
                        <div className="mt-1">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={imageFiles.length >= 10}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PhotoIcon className="h-5 w-5" />
                                {imageFiles.length > 0 ? "Add More Images" : "Choose Images"}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            {imagePreviews.length > 0 && (
                                <div className="mt-3 grid grid-cols-4 gap-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="h-24 w-full object-cover rounded-md border border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label="Remove image"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            {imageFiles.length > 0 
                                ? `${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} selected. ${imageFiles.length < 10 ? `You can add ${10 - imageFiles.length} more.` : 'Maximum reached.'}`
                                : 'Select up to 10 images (JPG, PNG, max 5MB each)'}
                        </p>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_available"
                            name="is_available"
                            checked={formData.is_available}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                            Available for rent
                        </label>
                    </div>

                    {/* Error message */}
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Posting..." : "Post Listing"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

