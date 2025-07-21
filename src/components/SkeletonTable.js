"use client";
import React from "react";

export default function SkeletonTable({ columns = 4, rows = 5 }) {
  return (
    <div className="overflow-x-auto rounded-2xl shadow animate-pulse">
      <table className="min-w-full w-full bg-white rounded-2xl text-gray-900 text-base overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-4 bg-gray-300 rounded w-2/3" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="even:bg-gray-50">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-4 py-4">
                  <div className="h-4 bg-gray-300 rounded w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
