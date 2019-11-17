import React from "react";
import {observer, useLocalStore} from "mobx-react-lite";
import "./index.scss";
import {UpdatableCard} from "../UpdatableCard";
import {Icon, Table, Tabs} from "antd";
import {Exchange} from "../../state/res/Exchange";
import {Market} from "../../state/res/Market";
import {mCol, Ob} from "../Util";
import {useStore} from "../../state";

const {TabPane} = Tabs;

export const MarketsView = observer(function MarketsView(props: {
  exchange: Exchange;
}) {
  const {exchange} = props;

  const {uiStates} = useStore();

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
        markets.push(...account.exchange.getMarketsByCoinSymbol(balance.key));
      });

      return (
        <TabPane tab={<Icon type="bank"/>} key={account.name}>
          <MarketsTable markets={markets}/>
        </TabPane>
      );
    }
  };

  return (
    <UpdatableCard
      title={"Markets"}
      className={"Markets"}
      updatableRes={exchange}
    >
      <Tabs defaultActiveKey="1" onChange={() => {
      }}>
        {/*<TabPane tab="Tab 3" key="3">*/}
        {/*  Content of Tab Pane 3*/}
        {/*</TabPane>*/}

        {renderCurrentAccount()}

        {state.quotes.map(v => {
          const markets = exchange.allMarkets.filter(o => o.spec.quote === v);
          return (
            <TabPane tab={v} key={v}>
              <MarketsTable markets={markets}/>
            </TabPane>
          );
        })}
      </Tabs>
    </UpdatableCard>
  );
});

{
  /*<Scrollbars style={{ height: 600 }} autoHide={true}>*/
}
{
  /*  <div className={"OrderBookContainer"}>AAA</div>*/
}
{
  /*</Scrollbars>*/
}

const MarketsTable = observer(function MarketsTable(props: {
  markets: Market[];
}) {
  const {markets} = props;

  const {uiStates} = useStore();

  return (
    <Table
      size={"small"}
      dataSource={markets}
      rowKey={(row: Market) => {
        return row.spec.symbol;
      }}
      onRow={(row: Market) => {
        return {
          onClick() {
            uiStates.market = row;
          }
        };
      }}
      columns={[
        mCol({
          dataIndex: "exchange",
          templateRender: (row: Market, v) => (
            <Ob
              r={() => {
                return <div>{row.spec.symbol}</div>;
              }}
            />
          )
        }),

        mCol({
          dataIndex: "price",
          templateRender: (row: Market, v) => (
            <Ob
              r={() => {
                return <div>{row.lastTicker && row.lastTicker.close}</div>;
              }}
            />
          )
        })
      ]}
    />
  );
});
