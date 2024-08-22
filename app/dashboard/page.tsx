import Customers from "@/components/reports/Customers";
import OrdersChart from "@/components/reports/Orders_Chart";

export default function ContentLayout() {
  return (
    <section className="container py-5 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
      <div className="h-auto col-span-2">
        <OrdersChart />
      </div>
      <div className="min-h-[16rem] h-auto col-span-1">
        <Customers />
      </div>
    </section>
  );
}
