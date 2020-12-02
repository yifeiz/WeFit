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
          <Nav.Link as={Link} to="/" style={{ color: "white" }}>
            Home
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/game"
            href="#features"
            style={{ color: "white" }}
          >
            Game
          </Nav.Link>
        </Nav>
      </Navbar>
    );
  }
}

export default Header;
