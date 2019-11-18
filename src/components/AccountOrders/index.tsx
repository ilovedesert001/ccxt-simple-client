import React from "react";
import { observer, useLocalStore } from "mobx-react-lite";
import "./index.scss";
import { OrderModel } from "../../model/models";
import { UpdatableCard } from "../UpdatableCard";
import { Tabs } from "antd";
import { FormatTimeAuto, MobTable, Ob } from "../Util";
import { Account } from "../../state/res/Account";
import { Market } from "../../state/res/Market";

const TabPane = Tabs.TabPane;

export const AccountOrders = observer(function AccountOrders(props: {
  account: Account;
  market: Market;
}) {
  const { account, market } = props;

  const res = account.safeGetAccountOrder(market);

  const state = useLocalStore(() => ({
    activeTab: "active" //active / all
  }));

  if (!res) {
    return null;
  }

  const renderTable = orders => {
    return (
      <MobTable<OrderModel>
        size={"small"}
        dataSource={orders}
        rowKey={"id"}
        columns={[
          {
            dataIndex: "symbol"
          },
          {
            dataIndex: "timestamp",
            render: v => <FormatTimeAuto val={v} />
          },
          {
            dataIndex: "side"
          },
          {
            dataIndex: "type"
          },
          {
            dataIndex: "status"
          },

          {
            dataIndex: "amount"
          },
          {
            dataIndex: "cost"
          },
          {
            dataIndex: "price"
          },
          {
            dataIndex: "filled"
          },
          {
            dataIndex: "remaining"
          }
        ]}
      />
    );
  };

  return (
    <UpdatableCard
      title={
        <div>
          Orders <Ob r={() => market.spec.symbol} />
        </div>
      }
      className={"UserOrders"}
      updatableRes={res}
    >
      <div className={"UserOrdersContainer"}>
        <Tabs
          defaultActiveKey="all"
          onChange={activeKey => {
            state.activeTab = activeKey;
          }}
        >
          <TabPane tab="Active" key="active">
            {renderTable(res.activeOrders)}
          </TabPane>
          <TabPane tab="All" key="all">
            {renderTable(res.all)}
          </TabPane>
        </Tabs>
      </div>
    </UpdatableCard>
  );
});
