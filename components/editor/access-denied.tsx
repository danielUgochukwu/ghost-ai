import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-accent/20 p-4">
          <Lock className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Access Denied</h1>
        <p className="max-w-md text-muted-foreground">
          You don't have access to this project, or it might not exist.
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/editor">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
