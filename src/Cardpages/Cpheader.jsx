import React from 'react'
import logo from '../assets/header1.png'
import { Link, useNavigate } from 'react-router-dom'
import '../Styles/Header.css'

const Cpheader = () => {
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="left">
        <img
          src={logo}
          alt="KL University"
          className="logo"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="right">
        <Link to="/login" className="login">Login</Link>
        <Link to="/register" className="register">Register</Link>
      </div>
    </header>
  )
}

export default Cpheader