import React from "react";
import { observer } from "mobx-react-lite";
import { FormatTimeAuto } from "../Util";
import { Icon } from "antd";
import "./index.scss";
import { eSide, eTickType, TradeModel } from "../../model/models";
import { UpdatableCard } from "../UpdatableCard";
import Scrollbars from "react-custom-scrollbars";
import { Market } from "../../state/res/Market";

export const RecentTrades = observer(function RecentTrades(props: {
  market: Market;
}) {
  const { market } = props;
  const res = market.recentTrades;
  const list = res.trades;

  return (
    <UpdatableCard
      title={"Recent Trades"}
      className={"RecentTrades"}
      updatableRes={res}
    >
      <Scrollbars style={{ height: 600 }} autoHide={true}>
        <div className={"TradeHistoryContainer"}>
          {list.map(o => (
            <RecentTradesItem key={o.id} trade={o} />
          ))}
        </div>
      </Scrollbars>
    </UpdatableCard>
  );
});

const RecentTradesItem = observer(function RecentTradesItem(props: {
  trade: TradeModel;
}) {
  const { trade } = props;

  return (
    <div className="TradeHistoryContainer_item">
      <div className="volume">{trade.amount}</div>
      <div className={`price ${trade.side}`}>
        <TickItem tick={trade.tick} />
        {trade.price}
      </div>
      <div className="time">
        <FormatTimeAuto val={trade.timestamp} />
      </div>
      {/*<div className="side">{trade.side === eSide.buy ? "B" : "S"}</div>*/}
    </div>
  );
});

const TickItem = observer(function TickItem(props: { tick: eTickType }) {
  const { tick } = props;

  let icon = <Icon type="arrow-up" />;

  switch (tick) {
    case eTickType.plusTick:
      icon = <Icon type="arrow-up" />;
      break;
    case eTickType.zeroPlusTick:
      icon = <Icon type="caret-up" />;
      break;
    case eTickType.minusTick:
      icon = <Icon type="arrow-down" />;
      break;
    case eTickType.zeroMinusTick:
      icon = <Icon type="caret-down" />;
      break;
  }

  return <div className={`icon ${tick}`}>{icon}</div>;
});
