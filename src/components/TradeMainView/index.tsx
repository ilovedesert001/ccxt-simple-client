import React from "react";
import {observer} from "mobx-react-lite";
import {Col, Row} from "antd";
import "./index.scss";
import {RecentTrades} from "../RecentTrades";
import {OrderBook} from "../OrderBook";
import {MarketsView} from "../MarketsView";
import {useStore} from "../../state";
import {Exchange} from "../../state/res/Exchange";
import {AccountOrders} from "../AccountOrders";
import {AccountsBalanceView} from "../AccountsBalanceView";

export const TradeMainView = observer(function TradeMainView(props: {
  exchange: Exchange;
}) {
  const {exchange} = props;

  const {uiStates} = useStore();

  return (
    <div className={"TradeMainView"}>
      <Row>
        <Col span={6}>
          <MarketsView exchange={exchange}/>
        </Col>

        {uiStates.market && (
          <>
            <Col span={6}>
              <OrderBook
                key={uiStates.market.spec.symbol}
                market={uiStates.market}
              />
            </Col>
            <Col span={6}>
              <RecentTrades
                key={uiStates.market.spec.symbol}
                market={uiStates.market}
              />
            </Col>
          </>
        )}

        <Col span={6}>
          <AccountsBalanceView exchange={exchange}/>
        </Col>
      </Row>

      {uiStates.market && uiStates.account && (
        <AccountOrders
          key={uiStates.market.spec.symbol + uiStates.account.name}
          account={uiStates.account}
          market={uiStates.market}
        />
      )}
    </div>
  );
});
