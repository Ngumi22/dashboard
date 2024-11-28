import Summary from "@/components/Dashboard/summary";
import BestSellingProductsReportPage from "@/components/reports/best-selling";
import Customers from "@/components/reports/Customers";
import OrdersChart from "@/components/reports/Orders_Chart";

export default function ContentLayout() {
  return (
    <section className="container p-5 space-y-5">
      <Summary />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
        <div className="h-auto col-span-2">
          <OrdersChart />
        </div>
        <div className="min-h-[16rem] h-auto col-span-1">
          <Customers />
        </div>

        <div className="min-h-[16rem] h-auto col-span-1">
          <BestSellingProductsReportPage />
        </div>
      </div>
    </section>
  );
}
