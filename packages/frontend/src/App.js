import "./App.css";
import Camera from "./components/Camera";
import Header from "./components/Header";
import { BrowserRouter as Router, Route, withRouter } from "react-router-dom";
import { Component } from "react";
import Hero from "./components/Hero"
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="App">
          <Route path="/" exact strict component={Hero} />
          <Route path="/game" exact strict component={Camera} />
        </div>
      </div>
    );
  }

}
export default withRouter(App);
