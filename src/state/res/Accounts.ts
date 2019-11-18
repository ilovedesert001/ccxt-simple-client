import { action, computed, observable } from "mobx";
import { AppRootStore } from "../AppRootStore";
import { Exchange } from "./Exchange";
import { BaseResModel } from "./Base";
import { Account } from "./Account";
import { CommonSubLs } from "../../Util";
import _ from "lodash";

export class Accounts extends BaseResModel<AppRootStore> {
  accountsMap = observable.map<string, Account>({}, { name: "accountsMap" });

  constructor(root, parent) {
    super(root, parent);

    this.createAccountsFromLs();
  }

  @computed get all() {
    return Array.from(this.accountsMap.values());
  }

  @action
  async createAccount(exchange: Exchange, name: string, cctxOption) {
    if (this.accountsMap.get(name)) {
      console.warn("已经存在此账户，不能重复添加",name);
    } else {
      const account = new Account(this.store, this);

      account.name = name;
      account.createCCXTOption = Object.assign(
        account.createCCXTOption,
        cctxOption
      );
      await account.createCCXTIns(exchange);
      this.accountsMap.set(name, account);
      return account;
    }
  }

  @action
  async createAccountAndSaveLs(exchange: Exchange, name: string, cctxOption) {
    const account = await this.createAccount(exchange, name, cctxOption);
    if (account) {
      this.lsAccountsAdd(exchange.exchange, account, cctxOption);
    }
  }

  lsAccounts = new CommonSubLs(this.store.config.ls, "accounts");
  lsAccountsAdd = (exchangeKey: string, account: Account, cctxOption) => {
    const arr = this.lsAccounts.lsGet("list", []) as IAccountLsOption[];
    const a = arr.find(o => o.name === account.name);
    if (a) {
      console.warn("已经存在",exchangeKey,account);
    } else {
      arr.push(
        Object.assign(
          {},
          {
            exchangeKey,
            name: account.name,
            cctxOption: cctxOption
          }
        )
      );
    }
    this.lsAccounts.lsSet("list", arr);
  };

  lsAccountsRemove = (accountName: string) => {
    let arr = this.lsAccounts.lsGet("list", []) as IAccountLsOption[];
    _.remove(arr, o => o.name === accountName);

    this.accountsMap.delete(accountName);
    this.lsAccounts.lsSet("list", arr);
  };

  lsAccountsGetAllAccounts = () => {
    const arr = this.lsAccounts.lsGet("list", []) as IAccountLsOption[];
    return arr;
  };

  createAccountsFromLs = async () => {
    const arr = this.lsAccountsGetAllAccounts();
    for (const o of arr) {
      const exchange = this.store.exchanges.exchangesMap.get(o.exchangeKey);
      if (exchange) {
        await this.createAccount(exchange, o.name, o.cctxOption);
      }
    }
  };
}

interface IAccountLsOption {
  exchangeKey: string;
  name: string;
  cctxOption: any;
}
