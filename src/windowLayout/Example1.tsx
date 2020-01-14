import { observer, useLocalStore } from "mobx-react-lite";
import { Layout, SimpleGridLayout } from "../multi_grid_layout/SimpleGridLayout";
import _ from "lodash";
import React, { useEffect } from "react";
import { toJS } from "mobx";
import { useStore } from "../state";
import { IWindowItem, WindowItemType } from "./WindowBase";
import { LayoutWindowComponent } from "./LayoutWindowComponent";
import "./index.scss";
import { testLayout } from "./index";

const ShowInfoBox = observer(function ShowInfoBox() {
  const store = useStore();
  const info = store.uiStates.info || {};

  return (
    <div>
      info:
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
});

export const MyWindowApp = () => {
  return <LayoutWindowComponent layout={testLayout} />;
};
