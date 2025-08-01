"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/button";

function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-center px-4">
      <Icon name="AlertTriangle" size="xl" isLottie />

      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>

      <p className="text-muted-foreground mb-6">
        Sorry, the page you are looking for doesn't exist.
      </p>
      <Button onClick={() => router.push("/")}>Go back home</Button>
    </div>
  );
}

export default NotFound;
