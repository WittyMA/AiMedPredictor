import React from "react";

export const KidneyIcon = ({ size = 48 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
  >
    <defs>
      <linearGradient id="kidneyGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#c14444" />
        <stop offset="100%" stopColor="#8b1a1a" />
      </linearGradient>
    </defs>
    <path
      d="M20 10c-8 8-8 20-3 28s5 18 13 18 10-10 10-18-3-10-3-18c0-6-4-12-10-12-3 0-5 1-7 2z"
      fill="url(#kidneyGrad)"
      stroke="#5a1010"
      strokeWidth="2"
    />
  </svg>
);
