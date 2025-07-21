"use client";
import React from "react";

export default function SkeletonCardGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl p-8 bg-gray-200 shadow-lg flex flex-col items-center justify-center h-[150px]"
        >
          <div className="h-10 w-14 bg-gray-300 rounded"></div>
          <div className="h-4 w-24 bg-gray-300 mt-4 rounded"></div>
        </div>
      ))}
    </div>
  );
}
