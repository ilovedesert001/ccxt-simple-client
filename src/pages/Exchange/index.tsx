import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { PageStruct } from "../Util";
import { ExchangeView } from "../../components/ExchangeView";
import { useStore } from "../../state";
import { useParams } from "react-router-dom";
import { Empty } from "antd";

export const ExchangePage = observer(function ExchangePage() {
  const { exchanges, uiStates } = useStore();

  const { exchangeKey } = useParams<{ exchangeKey: string }>();

  const exchange = exchanges.exchangesMap.get(exchangeKey);

  useEffect(() => {
    uiStates.changeExchange(exchange);
  }, [exchange]);

  return (
    <PageStruct>
      {exchange ? (
        <ExchangeView key={exchange.exchange} exchange={exchange} />
      ) : (
        <Empty />
      )}
    </PageStruct>
  );
});
