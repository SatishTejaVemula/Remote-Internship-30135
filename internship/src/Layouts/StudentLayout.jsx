import React from "react";
import { Outlet } from "react-router-dom";
import HeaderforStudent from "../Components/HeaderforStudent";

const StudentLayout = () => {
  return (
    <div className="layout-wrapper">
      <HeaderforStudent />
      <Outlet />
    </div>
  );
};

export default StudentLayout;