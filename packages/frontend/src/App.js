import "./App.css";
import Camera from "./components/Camera";
import { BrowserRouter as Router, Route, withRouter } from "react-router-dom";
import { Component } from "react";
import Hero from "./components/Hero"

class App extends Component {
  render() {
    return (
      <div className="App">
        <Route path="/" exact strict component={Hero} />
        <Route path="/game" exact strict component={Camera} />
      </div>
    );
  }

}
export default withRouter(App);
