import {
  Users,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Package,
  Shirt,
  LucideIcon,
  Icon,
  CreditCard,
} from "lucide-react";
import AnalyticsCard from "./analytics-card";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { title } from "process";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeType: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType,
}) => {
  return (
    <Card x-chunk="dashboard-01-chunk-2" className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <h2 className="font-bold text-2xl">{value}</h2>
        <div
          className={`flex gap-1 mt-2
        ${changeType === "increase" ? "text-green-500" : "text-red-500"}
        `}>
          {changeType === "increase" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <span className="text-xs">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const Summary = () => {
  const summaryData = [
    {
      title: "Orders",
      value: "1,342",
      icon: Package,
      change: "+30% since last year",
      changeType: "increase",
    },
    {
      title: "Revenue",
      value: "$29,072",
      icon: DollarSign,
      change: "-80% since last year",
      changeType: "decrease",
    },
    {
      title: "Customers",
      value: "3,242",
      icon: Users,
      change: "+10% since last year",
      changeType: "increase",
    },
    {
      title: "Products",
      value: "20",
      icon: Shirt,
      change: "-11% since last year",
      changeType: "decrease",
    },
  ];
  return (
    <AnalyticsCard title="Summary" subTitle="2024 Year Summary">
      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5">
        {summaryData.map((data, index) => (
          <SummaryCard
            key={index}
            title={data.title}
            value={data.value}
            icon={data.icon}
            change={data.change}
            changeType={data.changeType}
          />
        ))}
      </div>
    </AnalyticsCard>
  );
};

export default Summary;
