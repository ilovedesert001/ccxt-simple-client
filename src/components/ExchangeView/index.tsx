import React from "react";
import { observer } from "mobx-react-lite";
import "./index.scss";
import { UpdatableCard } from "../UpdatableCard";
import { useStore } from "../../state";
import { Exchange } from "../../state/res/Exchange";
import { TradeMainView } from "../TradeMainView";

export const ExchangeView = observer(function ExchangeView(props: {
  exchange: Exchange;
}) {
  const { exchange } = props;
  const { uiStates } = useStore();

  const list = exchange.allMarkets;

  return (
    <UpdatableCard
      title={<div>Exchange - {exchange.exchange}</div>}
      updatableRes={exchange}
    >
      <TradeMainView exchange={exchange} />
    </UpdatableCard>
  );
});
