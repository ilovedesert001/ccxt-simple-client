import React from "react";
import { observer } from "mobx-react-lite";
import { FormatBase, FormatQuote, FormatTimeAuto, TickItem } from "../Util";
import { Icon } from "antd";
import "./index.scss";
import { eSide, eTickType, TradeModel } from "../../model/models";
import { UpdatableCard } from "../UpdatableCard";
import Scrollbars from "react-custom-scrollbars";
import { Market } from "../../state/res/Market";
import { AutoSizeScrollBar } from "../AutoSizeScrollBar";

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
      <AutoSizeScrollBar>
        <div className={"TradeHistoryContainer"}>
          {list.map(o => (
            <RecentTradesItem key={o.id} trade={o} market={market} />
          ))}
        </div>
      </AutoSizeScrollBar>
    </UpdatableCard>
  );
});

const RecentTradesItem = observer(function RecentTradesItem(props: {
  trade: TradeModel;
  market: Market;
}) {
  const { trade, market } = props;

  return (
    <div className={`TradeHistoryContainer_item new`}>
      <div className="volume">
        <FormatBase val={trade.amount} spec={market.spec} />
      </div>
      <div className={`price ${trade.side}`}>
        <TickItem tick={trade.tick} />
        <FormatQuote val={trade.price} spec={market.spec} />
      </div>
      <div className="time">
        <FormatTimeAuto val={trade.timestamp} />
      </div>
      {/*<div className="side">{trade.side === eSide.buy ? "B" : "S"}</div>*/}
    </div>
  );
});
