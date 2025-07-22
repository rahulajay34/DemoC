"use client";
import { PulseLoader } from "react-spinners";

export default function Spinner({ size = 15, color = "#f97316" }) {
  return <PulseLoader size={size} color={color} />;
}