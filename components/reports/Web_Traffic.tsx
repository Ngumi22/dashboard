import React from "react";
import { GetServerSideProps } from "next";
import { generateWebTrafficReport } from "@/lib/reports"; // Function to fetch web traffic data from the database

interface WebTraffic {
  traffic_id: number;
  date: string;
  page_views: number;
  sessions: number;
  unique_visitors: number;
}

interface WebTrafficReportProps {
  trafficData: WebTraffic[];
}

export default function WebTrafficReport({
  trafficData,
}: WebTrafficReportProps) {
  return (
    <div>
      <h2>Web Traffic Report</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Page Views</th>
            <th>Sessions</th>
            <th>Unique Visitors</th>
          </tr>
        </thead>
        <tbody>
          {trafficData.map((traffic) => (
            <tr key={traffic.traffic_id}>
              <td>{traffic.date}</td>
              <td>{traffic.page_views}</td>
              <td>{traffic.sessions}</td>
              <td>{traffic.unique_visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const trafficData = await generateWebTrafficReport(); // Fetch the data directly from the database
  return {
    props: {
      trafficData,
    },
  };
};
