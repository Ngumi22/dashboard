import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/Auth_actions/auth-actions";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // console.log(user);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome, {user.name}!</CardTitle>
          <CardDescription>You are logged in as {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>User ID:</strong> {user.id}
            </p>
          </div>

          <div className="mt-6">
            <form action="/api/auth/logout">
              <Button type="submit" variant="outline">
                Logout
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {user.role === "admin" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin">Access Admin Panel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
