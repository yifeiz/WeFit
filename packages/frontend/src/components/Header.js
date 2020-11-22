import React, { Component } from "react";
import { Navbar, Nav } from "react-bootstrap";
import "../assets/css/Header.css";
import logo from "../assets/images/wefit.png";
import { Link } from "react-router-dom";

class Header extends Component {
  render() {
    return (
      <Navbar className="navbar">
        <Link to="/">
          <img className="logo" src={logo} alt="Logo" />
        </Link>
        <Nav className="mr-auto">
          <Nav.Link style={{ color: "white" }}>
            <Link to="/">Home</Link>
          </Nav.Link>
          <Nav.Link href="#features" style={{ color: "white" }}>
            <Link to="/game">Game</Link>
          </Nav.Link>
        </Nav>
      </Navbar>
    );
  }
}

export default Header;
