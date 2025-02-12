import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export function ProductReviews() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <Avatar>
            <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>John Doe</CardTitle>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= 4
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p>
            Great quality wallet, very durable and stylish. Highly recommended!
          </p>
        </CardContent>
      </Card>
      {/* Add more review cards as needed */}
    </div>
  );
}
