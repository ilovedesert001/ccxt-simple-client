import React from "react";
import {observer} from "mobx-react-lite";
import "./index.scss";
import {IBalanceRes} from "../../model/models";
import {UpdatableCard} from "../UpdatableCard";
import Scrollbars from "react-custom-scrollbars";
import {Badge, Progress} from "antd";
import {FormatPercentage, FormatValue, Ob} from "../Util";
import {Account} from "../../state/res/Account";
import {Market} from "../../state/res/Market";

export const CurrentBalance = observer(function CurrentBalance(props: {
  account: Account;
  market: Market;
}) {
  const {market, account} = props;

  // const account = uiStates.account; //accounts.all.find((o)=>o.)  //accounts.accountsMap.get()

  const res = account.balances;
  const balance = res.map.get(market.spec.base);

  if (!res || !balance) {
    return null;
  }

  const userOrder = account.safeGetAccountOrder(market);
  const {profit, rate} = account.computeProfitAndRate(market);

  return (
    <UpdatableCard
      title={
        <div>
          {account.name}-<Ob r={() => market.spec.symbol}/>
        </div>
      }
      className={"BalanceCard"}
      updatableRes={market}
    >
      <Scrollbars style={{height: 400}} autoHide={true}>
        <div className={"BalanceCardContainer"}>
          <BalanceItem balance={balance}/>

          <div className={"ProfitSection"}>
            <h3>Profit</h3>
            <div>
              <FormatValue val={profit} market={market.spec}/> /{" "}
              <FormatPercentage val={rate}/>
            </div>

            <div className={'profitRow2'}>
              <div>
                <Badge color="red" text="Cost"/>
                <FormatValue
                  val={account.computeOutMoneyByHistory(userOrder.all)}
                  market={market.spec}
                />
              </div>

              <div>
                <Badge color="green" text="Current Value"/>
                <FormatValue
                  val={account.computeCurrentValue(market)}
                  market={market.spec}
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
  balance: IBalanceRes;
}) {
  const {balance} = props;
  const usedPercent = (balance.used / balance.total) * 100;
  const freePercent = (balance.free / balance.total) * 100;

  const renderRow = (color: string, percent: number, text: string, val) => {
    return (
      <div className={"BalanceItemRow"}>
        <Progress percent={percent} size="small" showInfo={false}/>
        <div className={"BalanceItemRowDown"}>
          <Badge status="success" text={text}/>
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
