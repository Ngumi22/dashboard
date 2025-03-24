import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Access Denied</h1>
        <p className="text-xl text-muted-foreground">
          You dont have permission to access this page.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
