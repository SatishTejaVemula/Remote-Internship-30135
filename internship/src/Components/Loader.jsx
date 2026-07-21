import React from "react";
const Loader = () => {
  return (
    <div className="loader-wrapper">
      <svg className="loader-svg" viewBox="0 0 50 50">
        <circle
          className="arc arc1"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="arc arc2"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="arc arc3"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
};

export default Loader;