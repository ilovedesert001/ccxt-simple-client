import React from "react";
import {
  HashRouter as Router,
  Redirect,
  Route,
  Switch
} from "react-router-dom";
import "./index.scss";
import { Home } from "./Home";
import { ExchangePage } from "./Exchange";

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>

          <Route path={"/exchange/:exchangeKey"}>
            <ExchangePage />
          </Route>
          <Redirect from="/exchange" to="/exchange/none" />
        </Switch>
      </div>
    </Router>
  );
}
