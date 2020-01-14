import React from "react";
import { HashRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import "./index.scss";
import { Home } from "./Home";
import { ExchangePage } from "./Exchange";
import { MultiGridLayout } from "../multi_grid_layout";
import { GridTest } from "./Exchange/GridTest";
import { WindowLayoutDrawTest } from "./tests/WindowLayoutDrawTest";
import { MyWindowApp } from "../windowLayout/Example1";

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
          <Route path={"/exchange2/:exchangeKey"}>
            <GridTest />
          </Route>
          <Redirect from="/exchange" to="/exchange/none" />

          <Route exact path={"/test"}>
            <MultiGridLayout />
          </Route>

          <Route exact path={"/test/WindowLayoutDrawTest"}>
            <WindowLayoutDrawTest />
          </Route>
          <Route exact path={"/test/example1"}>
            <MyWindowApp />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
