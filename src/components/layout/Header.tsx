"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <h1 className="text-lg font-semibold">Data Architecture PoC</h1>
        <Button variant="outline" onClick={logout} size="sm">
          Sign Out
        </Button>
      </div>
    </header>
  );
}
