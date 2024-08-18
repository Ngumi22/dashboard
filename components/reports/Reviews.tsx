import React from "react";
import { GetServerSideProps } from "next";
import { generateReviewsReport } from "@/lib/reports"; // Function to fetch the reviews data from the database

interface Review {
  review_id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user_email: string;
  product_name: string;
}

interface ReviewsReportProps {
  reviews: Review[];
}

export default function ReviewsReport({ reviews }: ReviewsReportProps) {
  return (
    <div>
      <h2>Customer Reviews</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>User Email</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.review_id}>
              <td>{review.product_name}</td>
              <td>{review.rating}</td>
              <td>{review.comment}</td>
              <td>{review.user_email}</td>
              <td>{new Date(review.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const reviews = await generateReviewsReport(); // Fetch the data directly from the database
  return {
    props: {
      reviews,
    },
  };
};
