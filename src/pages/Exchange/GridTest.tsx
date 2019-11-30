import { observer, useLocalStore } from "mobx-react-lite";
import React from "react";
import { PageStruct } from "../Util";
import { ExchangeView } from "../../components/ExchangeView";
import { useStore } from "../../state";
import { useParams } from "react-router-dom";
import { Empty } from "antd";
import { Layout, LayoutItemType, SimpleGridLayout } from "../../multi_grid_layout/SimpleGridLayout";
import { MarketsView } from "../../components/MarketsView";
import { toJS } from "mobx";
import "./index.scss";
import { RecentTrades } from "../../components/RecentTrades";
import { OrderBook } from "../../components/OrderBook";
import { CommonSubLs } from "../../Util";
import _ from "lodash";
import { AccountsView } from "../../components/AccountsView";
import { CurrentBalance } from "../../components/CurrentBalance";
import { AccountOrders } from "../../components/AccountOrders";

export const GridTest = observer(function GridTest() {
  const store = useStore();

  const { exchanges, uiStates } = useStore();

  const blocks = {
    MarketsView: <BlockMarketsView />,
    OrderBook: <BlockOrderBook />,
    RecentTrades: <BlockRecentTrades />,
    AccountsView: <BlockAccountsView />,
    CurrentBalance: <BlockCurrentBalance />,
    AccountOrders: <BlockAccountOrders />

    // xxx: <BlockXXX />
  };

  const state = useLocalStore(() => {
    // save/load layout

    const ls = new CommonSubLs(store.config.ls, "GridTest");
    const getLsLayout = () => {
      const layout = ls.lsGet("layout", defaultLayout);
      return layout;
    };

    return {
      layout: getLsLayout(),
      getCurrentLayout() {
        return toJS(state.layout);
      },
      onLayoutChange: _.debounce(layout => {
        ls.lsSet("layout", layout);
      }, 1000)
    };
  });

  const layout = state.getCurrentLayout();

  const { exchangeKey } = useParams<{ exchangeKey: string }>();

  const exchange = exchanges.exchangesMap.get(exchangeKey);

  if (exchange) {
    uiStates.changeExchange(exchange);
  }
  return (
    <PageStruct>
      <div className={"GridTest"}>
        <SimpleGridLayout layout={layout} onLayoutChange={state.onLayoutChange} keyToComponents={blocks} />
      </div>
    </PageStruct>
  );
});

const defaultLayout = [
  {
    type: LayoutItemType.window,
    key: "markets",
    compKey: "MarketsView",
    node: {
      x: 24,
      y: 0,
      w: "300px",
      h: "350px"
    }
  },

  {
    type: LayoutItemType.window,
    key: "orderBook",
    compKey: "OrderBook",
    node: {
      x: 310,
      y: 0,
      w: "300px",
      h: "500px"
    }
  },

  {
    type: LayoutItemType.window,
    key: "trades",
    compKey: "RecentTrades",
    node: {
      x: 10,
      y: 350,
      w: "300px",
      h: "350px"
    }
  },

  {
    type: LayoutItemType.container,
    key: "container1",
    node: {
      x: 24,
      y: 24 * 10 + 24,
      w: "800px",
      h: "700px"
    },
    children: [
      {
        type: LayoutItemType.window,
        key: "container1_window1",
        compKey: "MarketsView",
        node: {
          x: 24,
          y: 24,
          w: "300px",
          h: "350px"
        }
      },
      {
        type: LayoutItemType.window,
        key: "container1_window2",
        compKey: "comp3",
        node: {
          x: 300,
          y: 24,
          w: "150px",
          h: "100px"
        }
      }
    ]
  }
] as Layout;

const BlockMarketsView = observer(function BlockMarketsView() {
  const { uiStates } = useStore();
  const exchange = uiStates.exchange;

  return (
    <div style={{ height: "100%" }}>{exchange && <MarketsView key={exchange.exchange} exchange={exchange} />}</div>
  );
});

const NeedMarket = <div>Need to select a market</div>;

const BlockRecentTrades = observer(function BlockRecentTrades() {
  const { uiStates } = useStore();
  const { market } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      {market ? <RecentTrades key={market.spec.symbol} market={market} /> : NeedMarket}
    </div>
  );
});

const BlockOrderBook = observer(function BlockOrderBook(props) {
  const { uiStates } = useStore();
  const { market } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      {market ? <OrderBook key={uiStates.market.spec.symbol} market={uiStates.market} /> : NeedMarket}
    </div>
  );
});

const BlockAccountsView = observer(function BlockAccountsView(props) {
  const { uiStates } = useStore();
  const { exchange } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      {exchange ? <AccountsView key={exchange.exchange} exchange={exchange} /> : <div>AccountsView</div>}
    </div>
  );
});

const BlockCurrentBalance = observer(function BlockCurrentBalance(props) {
  const { uiStates } = useStore();
  const { exchange, market, account } = uiStates;

  return (
    <div style={{ height: "100%" }}>
      {market && account ? (
        <CurrentBalance key={account.name + market.spec.symbol} market={market} account={account} />
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
