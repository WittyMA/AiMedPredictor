import React from "react";

export const LiverIcon = ({ size = 48 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
  >
    <defs>
      <linearGradient id="liverGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#b33b3b" />
        <stop offset="100%" stopColor="#802020" />
      </linearGradient>
    </defs>
    <path
      d="M12 30c0-10 12-16 26-16s14 6 14 16-4 20-16 20c-8 0-12-4-16-8s-8-8-8-12z"
      fill="url(#liverGrad)"
      stroke="#5a1010"
      strokeWidth="2"
    />
  </svg>
);
