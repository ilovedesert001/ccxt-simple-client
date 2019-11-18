import { action, computed, observable } from "mobx";
import { BaseResModel } from "./Base";
import { BalanceModel } from "../../model/models";
import _ from "lodash";
import { Account } from "./Account";

export class Balance extends BaseResModel<Account> {
  get ccxtIns() {
    return this.parent.ccxtIns;
  }

  map = observable.map<string, BalanceModel>({}, { name: "balance" });

  @action
  async updateRes() {
    this.loadingStart();

    let balances =  await this.ccxtIns.fetchBalance();
    _.each(balances, (balance : BalanceModel, key) => {
      balance.base = key;
    });
    delete balances["info"];
    this.map.merge(balances);

    this.loadingEnd();
  }

  @computed
  get balancesAll() {
    let items = Array.from(this.map.values());
    items = _.orderBy(items, ["total"], ["desc"]);
    return items;
  }

  @computed
  get balancesNotZero() {
    return this.balancesAll.filter(o => {
      return o.total > 0.0001;
    });
  }
}
