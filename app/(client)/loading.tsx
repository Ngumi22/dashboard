"use client";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-20 bg-gray-200 rounded animate-pulse" />
      <div className="h-40 bg-gray-200 rounded animate-pulse" />
      <div className="h-60 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
