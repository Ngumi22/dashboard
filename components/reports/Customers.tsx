import CurrentCustomers from "@/components/reports/Web_Traffic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Customers() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Customer Statistics</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 md:grid-cols-2 content-center gap-2">
        <CurrentCustomers />
        <CurrentCustomers />
      </CardContent>
    </Card>
  );
}
