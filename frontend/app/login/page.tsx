"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleSuccess = async (credentialResponse: {
        credential?: string;
    }) => {
        if (!credentialResponse.credential) {
            console.error("Google login did not return a credential");
            return;
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    credential: credentialResponse.credential,
                }),
            }
        );

        if (!response.ok) {
            console.error("Authentication failed");
            return;
        }

        router.push("/dashboard");
    };

    return (
        <main>
            <h1>Life Tracker</h1>

            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                    console.error("Google Login Failed");
                }}
            />
        </main>
    );
}