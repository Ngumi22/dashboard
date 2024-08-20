import OrdersChart from "@/components/reports/Orders_Chart";
import CurrentCustomers from "@/components/reports/Web_Traffic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContentLayout() {
  return (
    <section className="container pt-8 pb-8 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <OrdersChart />

      <Card className="h-full">
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>

        <CardContent>
          <CurrentCustomers />
        </CardContent>
      </Card>
    </section>
  );
}
