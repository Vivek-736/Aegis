"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetch("/api/auth/sync", {
        method: "POST",
      }).catch(console.error);
    }
  }, [isLoaded, isSignedIn]);

  return <>{children}</>;
}