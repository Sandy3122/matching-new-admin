
import React from "react";
import { LoaderCircle } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 32, className = "" }) => (
  <div className={`flex justify-center items-center animate-spin ${className}`} role="status">
    <LoaderCircle size={size} className="text-pink-500" />
    <span className="sr-only">Loading...</span>
  </div>
);

export default LoadingSpinner;
