import React from 'react'
import Headerfordash from "../Components/Headerfordash";
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div className="layout-wrapper">
      <Headerfordash />
      <Outlet />
    </div>
  );
};

export default AdminLayout