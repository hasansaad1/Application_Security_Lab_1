import { AuthLayout } from "@/components/ui/auth/AuthLayout";
import { AuthForm } from "@/components/ui/auth/AuthForm";
import Link from "next/link";

export default function SignupPage() {
    return (
        <AuthLayout
            title="Create your account"
            subtitle="Sign up to get started."
        >
            <AuthForm mode="register" />
            <p className="mt-4 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Log in
                </Link>
            </p>
        </AuthLayout>
    );
}
