import React from "react";
import { observer, useLocalStore } from "mobx-react-lite";
import "./index.scss";
import { eSide, OrderBookModel } from "../../model/models";
import { UpdatableCard } from "../UpdatableCard";
import Scrollbars from "react-custom-scrollbars";
import _ from "lodash";
import { Button } from "antd";
import { Market } from "../../state/res/Market";

export const OrderBook = observer(function OrderBook(props: {
  market: Market;
}) {
  const { market } = props;
  const res = market.orderBook;

  const state = useLocalStore(() => ({
    showNum: 14,
    side: eSide.both as eSide,
    get asks() {
      let items = [];
      if (state.side === eSide.both) {
        items = _.take(res.asks, state.showNum);
      } else {
        items = res.asks; //_.take(, state.showNum * 2);
      }
      const reversed = items.reverse();
      return reversed;
    },
    get bids() {
      if (state.side === eSide.both) {
        return _.take(res.bids, state.showNum);
      } else {
        return res.bids; // _.take(res.bids, state.showNum * 2);
      }
    },

    setSide(side: eSide) {
      state.side = side;
    }
  }));

  const { asks, bids } = state;

  const renderList = (list: OrderBookModel[], side: string) => {
    return (
      <div className={side}>
        {list.map((o, index) => (
          <OrderBookItem key={index} item={o} />
        ))}
      </div>
    );
  };

  return (
    <UpdatableCard
      title={"OrderBook"}
      className={"OrderBook"}
      updatableRes={res}
    >
      <Scrollbars style={{ height: 600 }} autoHide={true}>
        <div className={"OrderBookContainer"}>
          <div className="OrderBookInnerHeader">
            <div className="sideBtns">
              <Button
                size={"small"}
                icon="vertical-align-middle"
                onClick={() => state.setSide(eSide.both)}
              />
              <Button
                size={"small"}
                icon="vertical-align-top"
                onClick={() => state.setSide(eSide.buy)}
              />
              <Button
                size={"small"}
                icon="vertical-align-bottom"
                onClick={() => state.setSide(eSide.sell)}
              />
            </div>
          </div>

          <div className="centeredContent">
            {state.side === eSide.both ? (
              <>
                {renderList(asks, "asks")}
                <div className={"MarketPrice"}>
                  <MarketPrice market={market} />
                </div>
                {renderList(bids, "bids")}
              </>
            ) : (
              <>
                <div className={"MarketPrice"}>
                  <MarketPrice market={market} />
                </div>
                {state.side === eSide.buy && renderList(asks, "asks")}
                {state.side === eSide.sell && renderList(asks, "bids")}
              </>
            )}
          </div>
        </div>
      </Scrollbars>
    </UpdatableCard>
  );
});

const OrderBookItem = observer(function OrderBookItem(props: {
  item: OrderBookModel;
}) {
  const { item } = props;

  return (
    <div className="OrderBookItem">
      <div className={"price"}>{item.price}</div>
      <div className={"size"}>{item.size}</div>
      <div className={"accumulateSize"}>{item.accumulateSize}</div>
    </div>
  );
});

const MarketPrice = observer(function MarketPrice(props: { market: Market }) {
  const { market } = props;
  return <div>{market.lastPrice}</div>;
});
