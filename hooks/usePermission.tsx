"use client";

import { useState, useEffect } from "react";

export const usePermission = (
  user: { id: number; role: string },
  entity: string,
  action: string
) => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate permission check logic (replace with real API call or logic)
    const hasPermission = user.role === "admin" || user.role === "super-admin"; // Example logic
    setIsAllowed(hasPermission);
    setLoading(false);
  }, [user, entity, action]);

  return { isAllowed, loading };
};
