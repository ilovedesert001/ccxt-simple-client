import React from "react";
import { observer, useLocalStore } from "mobx-react-lite";
import "./index.scss";
import { UpdatableCard } from "../UpdatableCard";
import { Icon, Tabs } from "antd";
import { Exchange } from "../../state/res/Exchange";
import { Market } from "../../state/res/Market";
import { MobTable } from "../Util";
import { useStore } from "../../state";
import Scrollbars from "react-custom-scrollbars";

const { TabPane } = Tabs;

export const MarketsView = observer(function MarketsView(props: {
  exchange: Exchange;
}) {
  const { exchange } = props;

  const { uiStates } = useStore();

  const state = useLocalStore(() => ({
    get quotes(): string[] {
      const s = new Set<string>();
      const list = exchange.allMarkets;
      list.forEach(o => {
        s.add(o.spec.quote);
      });
      return Array.from(s);
    }
  }));

  const renderCurrentAccount = () => {
    let account = uiStates.account; //store.accounts.all.find(o => o.exchange === exchange);

    if (!account) {
      return null;
    } else {
      const balances = account.balances.balancesNotZero;

      const markets: Market[] = [];
      balances.forEach(balance => {
        markets.push(
          ...account.exchange.getMarketsByCoinSymbolFilterActive(balance.base)
        );
      });

      return (
        <TabPane tab={<Icon type="bank" />} key={account.name}>
          <MarketsList markets={markets} />
        </TabPane>
      );
    }
  };

  return (
    <UpdatableCard
      title={"Markets"}
      className={"Markets"}
      updatableRes={exchange}
      updateImmediately={false}
    >
      <Tabs defaultActiveKey="1" onChange={() => {}}>
        {renderCurrentAccount()}
        {state.quotes.map(v => {
          const markets = exchange.allMarkets.filter(
            o => o.spec.active && o.spec.quote === v
          );
          return (
            <TabPane tab={v} key={v}>
              <MarketsList markets={markets} />
            </TabPane>
          );
        })}
      </Tabs>
    </UpdatableCard>
  );
});

const MarketsList = observer(function MarketsTable(props: {
  markets: Market[];
}) {
  const { markets } = props;

  const { uiStates } = useStore();

  return (
    <Scrollbars style={{ height: 550 }} autoHide={true}>
      <div className={"MarketsList"}>
        {markets.map(row => (
          <div
            className={"MarketsListItem"}
            onClick={() => {
              uiStates.market = row;
            }}
          >
            <div className="exchangeName">{row.spec.symbol}</div>
            <div className="latestPrice">
              {row.lastTicker && row.lastTicker.close}
            </div>
          </div>
        ))}
      </div>
    </Scrollbars>
  );
});
