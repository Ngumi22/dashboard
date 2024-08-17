import OrdersCard from "@/components/reports/Orders";
import SalesCard from "@/components/reports/SalesCard";

export default function ContentLayout() {
  return (
    <div className="container pt-8 pb-8 px-4 sm:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OrdersCard />
        <SalesCard />
        <OrdersCard />
        <SalesCard />
      </div>
    </div>
  );
}
