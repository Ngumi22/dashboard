import OrdersCard from "@/components/reports/Orders";
import SalesCard from "@/components/reports/SalesCard";
import BestSellingProductsReport from "@/components/reports/best-selling";

interface ContentLayoutProps {
  orderSummary: any;
  bestSellingProducts: any[];
  salesReport: any;
}

export default function ContentLayout({
  orderSummary,
  bestSellingProducts,
  salesReport,
}: ContentLayoutProps) {
  return (
    <div className="container pt-8 pb-8 px-4 sm:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BestSellingProductsReport products={bestSellingProducts} />
        <SalesCard />
      </div>
    </div>
  );
}
