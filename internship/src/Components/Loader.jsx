import React from "react";
import "../Styles/Loader.css";

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="loader-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default Loader;