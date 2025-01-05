import React from "react";

export default function UserPage({ params }: { params: { user_id: string } }) {
  const { user_id } = params;
  return <div>User: {user_id}</div>;
}
