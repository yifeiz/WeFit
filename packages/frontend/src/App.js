import "./assets/css/App.css";
import Camera from "./components/Camera";
import Header from "./components/Header";
import { Route, withRouter } from "react-router-dom";
import { Component } from "react";
import LandingPage from "./components/LandingPage";
import "bootstrap/dist/css/bootstrap.min.css";

class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="App">
          <Route path="/" exact strict component={LandingPage} />
          <Route path="/game" exact strict component={Camera} />
        </div>
      </div>
    );
  }
}
export default withRouter(App);
