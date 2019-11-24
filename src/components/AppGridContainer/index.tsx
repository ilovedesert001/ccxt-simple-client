import React, { useRef } from "react";
import { observer, useLocalStore } from "mobx-react-lite";
import "./index.scss";
import { Card } from "antd";
import { toJS } from "mobx";
import _ from "lodash";
import { CommonSubLs } from "../../Util";
import { useStore } from "../../state";
import { MarketsView } from "../MarketsView";

import RGL, { WidthProvider } from "react-grid-layout";
import { AutoSizeScrollBar } from "../AutoSizeScrollBar";
import { RecentTrades } from "../RecentTrades";
import { OrderBook } from "../OrderBook";
import { AccountsView } from "../AccountsView";
import { CurrentBalance } from "../CurrentBalance";
import { AccountOrders } from "../AccountOrders";

const ReactGridLayout = WidthProvider(RGL);

export const AppGridContainer = observer(function AppGridContainer(props: {}) {
  const store = useStore();

  const el = useRef(null as HTMLDivElement);

  const state = useLocalStore(() => {
    // save/load layout

    const ls = new CommonSubLs(store.config.ls, "AppGridContainer");
    const getLsLayout = () => {
      const layout = ls.lsGet("layout", defaultLayout);
      return layout;
    };

    return {
      gridLayout: getLsLayout(),
      getCurrentLayout() {
        return toJS(state.gridLayout);
      },
      onLayoutChange: _.debounce(layout => {
        ls.lsSet("layout", layout);
      }, 1000)
    };
  });

  const blocks = {
    MarketsView: <BlockMarketsView />,
    OrderBook: <BlockOrderBook />,
    RecentTrades: <BlockRecentTrades />,
    AccountsView: <BlockAccountsView />,
    CurrentBalance: <BlockCurrentBalance />,
    AccountOrders: <BlockAccountOrders />

    // xxx: <BlockXXX />
  };

  const safeGetComponent = key => {
    let comp = blocks[key];
    if (!comp) {
      comp = <div>nothing</div>;
    }
    return comp;
  };

  const layout = state.getCurrentLayout();

  const generateDOM = () => {
    return layout.map(row => (
      <div key={row.i}>{safeGetComponent(row.i)}</div>
    )) as any;
  };

  return (
    <div className={"AppGridContainer"} ref={el}>
      <ReactGridLayout
        className="GridLayoutLayout"
        layout={layout}
        onLayoutChange={state.onLayoutChange}
        cols={20}
        rowHeight={24}
        margin={[2, 2]}
        // verticalCompact={false}

        // A CSS selector for tags that will not be draggable.
        // For example: draggableCancel:'.MyNonDraggableAreaClassName'
        // If you forget the leading . it will not work.
        draggableHandle={".ant-card-head"}
        draggableCancel={".ant-card-body"}
        // width={1200}
      >
        {generateDOM()}
        {/*<div key="MarketsView">*/}
        {/*  <BlockMarketsView />*/}
        {/*</div>*/}
        {/*<div key="OrderBook">b</div>*/}
        {/*<div key="RecentTrades">c</div>*/}
      </ReactGridLayout>
    </div>
  );
});

const defaultLayout = [
  { w: 6, h: 15, x: 0, y: 62, i: "xxx", moved: false, static: false },
  { w: 6, h: 21, x: 0, y: 0, i: "MarketsView", moved: false, static: false },
  { w: 6, h: 21, x: 6, y: 0, i: "OrderBook", moved: false, static: false },
  { w: 6, h: 21, x: 12, y: 0, i: "RecentTrades", moved: false, static: false },
  { w: 6, h: 22, x: 0, y: 21, i: "AccountsView", moved: false, static: false },
  {
    w: 6,
    h: 22,
    x: 6,
    y: 21,
    i: "CurrentBalance",
    moved: false,
    static: false
  },
  { w: 20, h: 19, x: 0, y: 43, i: "AccountOrders", moved: false, static: false }
];

const BlockMarketsView = observer(function BlockMarketsView() {
  const { uiStates } = useStore();
  const exchange = uiStates.exchange;

  return (
    <div style={{ height: "100%" }}>
      {exchange && <MarketsView key={exchange.exchange} exchange={exchange} />}
    </div>
  );
});

const NeedMarket = <div>Need to select a market</div>;

const BlockRecentTrades = observer(function BlockRecentTrades() {
  const { uiStates } = useStore();
  const { market } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      {market ? (
        <RecentTrades key={market.spec.symbol} market={market} />
      ) : (
        NeedMarket
      )}
    </div>
  );
});

const BlockOrderBook = observer(function BlockOrderBook(props) {
  const { uiStates } = useStore();
  const { market } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      {market ? (
        <OrderBook key={uiStates.market.spec.symbol} market={uiStates.market} />
      ) : (
        NeedMarket
      )}
    </div>
  );
});

const BlockAccountsView = observer(function BlockAccountsView(props) {
  const { uiStates } = useStore();
  const { exchange } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      {exchange ? (
        <AccountsView key={exchange.exchange} exchange={exchange} />
      ) : (
        <div>AccountsView</div>
      )}
    </div>
  );
});

const BlockCurrentBalance = observer(function BlockCurrentBalance(props) {
  const { uiStates } = useStore();
  const { exchange, market, account } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      {market && account ? (
        <CurrentBalance
          key={account.name + market.spec.symbol}
          market={market}
          account={account}
        />
      ) : (
        <div>Balance</div>
      )}
    </div>
  );
});

const BlockAccountOrders = observer(function BlockAccountOrders(props) {
  const { uiStates } = useStore();
  const { exchange, market, account } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      {market && account ? (
        <AccountOrders
          key={uiStates.market.spec.symbol + uiStates.account.name}
          account={uiStates.account}
          market={uiStates.market}
        />
      ) : (
        <div>account order</div>
      )}
    </div>
  );
});

const BlockXXX = observer(function BlockOrderBook(props) {
  const { uiStates } = useStore();
  const { market } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      <Card
        headStyle={{ color: "black" }}
        bodyStyle={{ color: "black" }}
        size="small"
        title="Small size card"
        extra={<a href="#">More</a>}
      >
        <div
          style={{
            display: "flex",
            background: "red",
            height: "100%"
          }}
        >
          <AutoSizeScrollBar>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
            <div
              style={{
                width: 500,
                height: 200,
                background: "#6547ac",
                border: "8px solid yellow"
              }}
            >
              AAAa
            </div>
          </AutoSizeScrollBar>
        </div>
      </Card>
    </div>
  );
});
