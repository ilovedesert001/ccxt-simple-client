import React from "react";
import { observer } from "mobx-react-lite";
import "./index.scss";
import { useStore } from "../../state";
import { Exchange } from "../../state/res/Exchange";
import { AppGridContainer } from "../AppGridContainer";

export const TradeMainView = observer(function TradeMainView(props: {
  exchange: Exchange;
}) {
  const { exchange } = props;

  const { uiStates } = useStore();

  return (
    <div className={"TradeMainView"}>
      <AppGridContainer />
    </div>
  );
});
