import React from "react";
import { observer } from "mobx-react-lite";
import { Col, Row } from "antd";
import "./index.scss";
import { RecentTrades } from "../RecentTrades";
import { OrderBook } from "../OrderBook";
import { MarketsView } from "../MarketsView";
import { useStore } from "../../state";
import { Exchange } from "../../state/res/Exchange";
import { AccountOrders } from "../AccountOrders";
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
