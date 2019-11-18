import { AppSubStore } from "./AppSubStore";
import { AppRootStore } from "./AppRootStore";
import { action, observable } from "mobx";
import { Exchange } from "./res/Exchange";
import { Market } from "./res/Market";
import { Account } from "./res/Account";

export class UiStates extends AppSubStore<AppRootStore> {
  @observable exchange: Exchange = null;

  @observable market: Market = null;

  @observable account: Account = null;

  @action changeExchange(exchange: Exchange) {
    this.exchange = exchange;
    this.market = null;
    this.account = null;
  }
}
