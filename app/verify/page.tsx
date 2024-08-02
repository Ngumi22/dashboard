"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Verify() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token) {
      fetch(`/api/verify?token=${token}`)
        .then((response) => {
          if (response.ok) {
            setStatus("Email successfully verified! Redirecting to login...");
            setTimeout(() => {
              router.push("/login");
            }, 3000);
          } else {
            throw new Error("Verification failed");
          }
        })
        .catch(() => {
          setStatus("Verification failed. Please try again.");
        });
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1>Login to your email to verify your email</h1>
    </div>
  );
}
