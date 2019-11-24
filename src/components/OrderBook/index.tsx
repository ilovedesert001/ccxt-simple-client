import React, { useEffect, useRef, useState } from "react";
import { observer, useLocalStore } from "mobx-react-lite";
import "./index.scss";
import { eSide, OrderBookModel } from "../../model/models";
import { UpdatableCard } from "../UpdatableCard";
import Scrollbars from "react-custom-scrollbars";
import _ from "lodash";
import { Button } from "antd";
import { Market } from "../../state/res/Market";
import { FormatBase, FormatQuote, NumberSeparateFormat } from "../Util";
import { AutoSizeScrollBar } from "../AutoSizeScrollBar";
import { useMeasure } from "react-use";

export const OrderBook = observer(function OrderBook(props: {
  market: Market;
}) {
  const { market } = props;
  const res = market.orderBook;

  const [ref, size] = useMeasure();

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
    },

    setShowNum: _.throttle((num: number) => {
      state.showNum = num;
    }, 500)
  }));

  useEffect(() => {
    console.log("AAA", size.height);
    state.setShowNum(Math.floor(size.height / 40));
  }, [size.height]);

  const { asks, bids } = state;

  const renderList = (list: OrderBookModel[], side: string) => {
    // return  <div>AA</div>

    return (
      <div className={side}>
        {list.map((o, index) => (
          <OrderBookItem key={o.price} item={o} market={market} />
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
      <div style={{ height: "100%" }}>
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
          {state.side === eSide.both ? (
            <div ref={ref} className="centeredContent">
              {renderList(asks, "asks")}
              <div className={"MarketPrice"}>
                <MarketPrice market={market} />
              </div>
              {renderList(bids, "bids")}
            </div>
          ) : (
            <div className={"sideContent"}>
              <div className={"MarketPrice"}>
                <MarketPrice market={market} />
              </div>
              <div className={"sideContentList"}>
                <AutoSizeScrollBar>
                  {state.side === eSide.buy && renderList(asks, "asks")}
                  {state.side === eSide.sell && renderList(bids, "bids")}
                </AutoSizeScrollBar>
              </div>
            </div>
          )}
        </div>
      </div>
    </UpdatableCard>
  );
});

const OrderBookItem = observer(function OrderBookItem(props: {
  item: OrderBookModel;
  market: Market;
}) {
  const { item, market } = props;

  return (
    <div className="OrderBookItem">
      <div className={"price"}>
        <FormatQuote val={item.price} spec={market.spec} />
      </div>

      <HighLight className={"size"} updateDep={item.size}>
        <FormatBase val={item.size} spec={market.spec} />
      </HighLight>
      <div className={"accumulateSize"}>
        <FormatBase val={item.accumulateSize} spec={market.spec} />
      </div>
    </div>
  );
});

const MarketPrice = observer(function MarketPrice(props: { market: Market }) {
  const { market } = props;
  return (
    <div>
      {" "}
      <FormatQuote val={market.lastPrice} spec={market.spec} />
    </div>
  );
});

const HighLight = (props: {
  className: string;
  updateDep: any;
  children: any;
  highLightImmediate?: boolean;
}) => {
  const { className, children, updateDep, highLightImmediate } = props;
  const el = useRef(null as HTMLDivElement);

  const [state, setState] = useState(() => {
    return {
      resetAnim() {
        const element = el.current;
        // -> removing the class
        element.classList.remove("new");
        void element.offsetWidth;
        element.classList.add("new");
      }
    };
  });

  const [ins] = useState(() => ({
    onUpdateFunction() {}
  }));

  useEffect(() => {
    ins.onUpdateFunction();
  }, [updateDep]);

  useEffect(() => {
    if (highLightImmediate) {
      state.resetAnim();
    }
    ins.onUpdateFunction = state.resetAnim;
  }, []);

  return (
    <div ref={el} className={`${className} highLight`}>
      {children}
    </div>
  );
};
