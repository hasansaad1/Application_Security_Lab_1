import { AuthLayout } from "@/components/ui/auth/AuthLayout";
import { AuthForm } from "@/components/ui/auth/AuthForm";
import Link from "next/link";

export default function LoginPage() {
    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to access your account."
        >
            <AuthForm mode="login" />
            <p className="mt-4 text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Sign up
                </Link>
            </p>
        </AuthLayout>
    );
}
