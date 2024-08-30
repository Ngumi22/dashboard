const AnalyticsCard = ({
  children,
  title,
  subTitle,
}: {
  children: React.ReactNode;
  title: string;
  subTitle: string;
}) => {
  return <div className="border w-full p-6 h-full rounded-md">{children}</div>;
};

export default AnalyticsCard;
