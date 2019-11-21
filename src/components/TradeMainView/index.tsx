import React from "react";
import { observer } from "mobx-react-lite";
import { Col, Row } from "antd";
import "./index.scss";
import { RecentTrades } from "../RecentTrades";
import { OrderBook } from "../OrderBook";
import { MarketsView } from "../MarketsView";
import { useStore } from "../../state";
import { Exchange } from "../../state/res/Exchange";
import { AccountOrders } from "../AccountOrders";
import { AccountsBalanceView } from "../AccountsBalanceView";
import { TradingView } from "../TradingView";

export const TradeMainView = observer(function TradeMainView(props: {
  exchange: Exchange;
}) {
  const { exchange } = props;

  const { uiStates } = useStore();

  return (
    <div className={"TradeMainView"}>
      <Row>
        <Col md={6} sm={12} xs={24}>
          <MarketsView exchange={exchange} />
        </Col>

        {uiStates.market && (
          <>
            <Col md={6} sm={12} xs={24}>
              <OrderBook
                key={uiStates.market.spec.symbol}
                market={uiStates.market}
              />
            </Col>
            <Col md={6} sm={12} xs={24}>
              <RecentTrades
                key={uiStates.market.spec.symbol}
                market={uiStates.market}
              />
            </Col>
          </>
        )}

        <Col md={6} sm={12} xs={24}>
          <AccountsBalanceView exchange={exchange} />
        </Col>
      </Row>

      {uiStates.market && (
        <Row>
          <Col span={24}>
            <TradingView
              key={uiStates.market.spec.symbol}
              market={uiStates.market}
            />
          </Col>
        </Row>
      )}

      <Row>
        <Col span={24}>
          <div style={{ maxWidth: "100%", overflowX: "scroll" }}>
            <div style={{ minWidth: 900 }}>
              {uiStates.market && uiStates.account && (
                <AccountOrders
                  key={uiStates.market.spec.symbol + uiStates.account.name}
                  account={uiStates.account}
                  market={uiStates.market}
                />
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
});
