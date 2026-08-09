import React from 'react'
import HeaderMain from '../Components/Headermain'
import Footer from '../Components/Footer'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <>
    <HeaderMain />
    <Outlet />
    <Footer />
    </>
  )
}

export default MainLayout