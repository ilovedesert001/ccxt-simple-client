import React from "react";
import { observer } from "mobx-react-lite";
import "./index.scss";
import { BalanceModel } from "../../model/models";
import { UpdatableCard } from "../UpdatableCard";
import Scrollbars from "react-custom-scrollbars";
import { Badge, Progress } from "antd";
import {
  FormatBase,
  FormatPercentage,
  FormatQuote,
  FormatValue,
  Ob
} from "../Util";
import { Account } from "../../state/res/Account";
import { Market } from "../../state/res/Market";

export const CurrentBalance = observer(function CurrentBalance(props: {
  account: Account;
  market: Market;
}) {
  const { market, account } = props;

  // const account = uiStates.account; //accounts.all.find((o)=>o.)  //accounts.accountsMap.get()

  const res = account.balances;
  const balance = res.map.get(market.spec.base);

  if (!res || !balance) {
    return null;
  }

  const userOrder = account.safeGetAccountOrder(market);
  const profitByMarketPrice = account.computeProfitAndRateByMarketPrice(market);
  const profitByOrderBook = account.computeProfitAndRateByOrderBook(market);

  return (
    <UpdatableCard
      title={
        <div>
          {account.name}-<Ob r={() => market.spec.symbol} />
        </div>
      }
      className={"BalanceCard"}
      updatableRes={market}
    >
      <Scrollbars style={{ height: 400 }} autoHide={true}>
        <div className={"BalanceCardContainer"}>
          <BalanceItem balance={balance} />

          <div className={"ProfitSection"}>
            <h3>Profit (By Latest price = Market Price)</h3>
            <div>
              <FormatQuote
                val={profitByMarketPrice.profit}
                spec={market.spec}
                withUnit
              />
              / <FormatPercentage val={profitByMarketPrice.rate} />
            </div>

            <h3>Profit (By OrderBook )</h3>
            <div>
              <FormatQuote
                val={profitByOrderBook.profit}
                spec={market.spec}
                withUnit
              />
              / <FormatPercentage val={profitByOrderBook.rate} />
            </div>

            <div className={"profitRow2"}>
              <div>
                <Badge color="red" text="Cost" />
                <FormatQuote
                  val={account.computeOutMoneyByHistory(userOrder.all)}
                  spec={market.spec}
                  withUnit
                />
              </div>

              <div>
                <Badge color="green" text="Current Value" />
                <FormatQuote
                  val={account.computeCurrentValue(market)}
                  spec={market.spec}
                  withUnit
                />
              </div>

              <div>
                <Badge color="green" text="OrderBook Value" />
                <FormatQuote
                  val={account.computeOrderBookValue(market)}
                  spec={market.spec}
                  withUnit
                />
              </div>
            </div>
          </div>
        </div>
      </Scrollbars>
    </UpdatableCard>
  );
});

const BalanceItem = observer(function BalanceItem(props: {
  balance: BalanceModel;
}) {
  const { balance } = props;
  const usedPercent = (balance.used / balance.total) * 100;
  const freePercent = (balance.free / balance.total) * 100;

  const renderRow = (color: string, percent: number, text: string, val) => {
    return (
      <div className={"BalanceItemRow"}>
        <Progress percent={percent} size="small" showInfo={false} />
        <div className={"BalanceItemRowDown"}>
          <Badge status="success" text={text} />
          <div className={"BalanceItemRowText"}>{balance.total}</div>
        </div>
      </div>
    );
  };

  return (
    <div className={"BalanceItem"}>
      {renderRow("green", 100, "Total", balance.total)}
      {renderRow("green", freePercent, "Free", balance.free)}
      {renderRow("green", usedPercent, "Used", balance.used)}
    </div>
  );
});
