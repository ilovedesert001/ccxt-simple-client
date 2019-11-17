import {action, computed, observable} from "mobx";
import {AppRootStore} from "../AppRootStore";
import {Exchange} from "./Exchange";
import {BaseResModel} from "./Base";
import _ from "lodash";

export class Exchanges extends BaseResModel<AppRootStore> {
  exchangesMap = observable.map<string, Exchange>({}, {name: "exchangesMap"});

  constructor(root, parent) {
    super(root, parent);

    const bigone3 = new Exchange(this.store, this);
    this.exchangesMap.set(bigone3.exchange, bigone3);

    /*    const zb = new Exchange(this.store, this);
    {
      zb.exchange = "zb";
      zb.createCCXTOption = {
        urls: {
          api: {
            private: "https://api.zb.plus/data/v1",
            public: "https://api.zb.plus/data/v1"
          }
        }
      } as any;
      this.exchangesMap.set("zb", zb);
    }
    */

    const exchangesNames = ["bittrex"];

    ///ccxt.exchanges
    _.each(exchangesNames, name => {
      const item = new Exchange(this.store, this);
      item.exchange = name;
      item.createCCXTOption = {} as any;
      this.exchangesMap.set(name, item);
    });
  }

  @computed get all() {
    return Array.from(this.exchangesMap.values());
  }

  @action
  async initExchanges() {
    for (const exchange of this.all) {
      await exchange.createCCXTIns();
    }
  }
}
