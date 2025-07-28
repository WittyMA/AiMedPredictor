import React from "react";

export const BreastIcon = ({ size = 48 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
  >
    <defs>
      <radialGradient id="breastGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f9c0c0" />
        <stop offset="100%" stopColor="#e48a8a" />
      </radialGradient>
    </defs>
    <circle cx="22" cy="32" r="10" fill="url(#breastGrad)" stroke="#a35a5a" strokeWidth="2" />
    <circle cx="42" cy="32" r="10" fill="url(#breastGrad)" stroke="#a35a5a" strokeWidth="2" />
    <circle cx="22" cy="32" r="2" fill="#b35454" />
    <circle cx="42" cy="32" r="2" fill="#b35454" />
  </svg>
);
