import {action, computed, observable, runInAction} from "mobx";
import {BaseResModel} from "./Base";
import {Market} from "./Market";
import {Exchanges} from "./Exchanges";
import _ from "lodash";
import {ITickerRes} from "../../model/models";

export class Exchange extends BaseResModel<Exchanges> {
  marketsMap = observable.map<string, Market>({}, {name: "marketsMap"});

  constructor(root, parent) {
    super(root, parent);

    window['bigone'] = this;
  }

  @observable ccxtIns = null as any;

  @observable exchange = "bigone3"; // 对应ccxt里的名字

  @observable createCCXTOption = {

    urls: {
      // 'api': 'https://b1.run/api/v3/',
      api: {
        private: "https://b1.run/api/v3/viewer",
        public: "https://b1.run/api/v3"
      }
    }
  };


  @observable fetchedMarkets = false;

  @action
  async updateRes() {
    this.loadingStart();

    if (!this.fetchedMarkets) {
      this.fetchedMarkets = true;
      let items = await this.ccxtIns.fetchMarkets();
      console.log("刷新市场");
      runInAction(() => {
        items.forEach(item => {
          const res = new Market(this.store, this, item);
          this.marketsMap.set(item.symbol, res);
        });

      });
    }

    let items = await this.ccxtIns.fetchTickers();
    runInAction(() => {
      _.each(items, (item: ITickerRes) => {
        const market = this.marketsMap.get(item.symbol);
        if (market) {
          market.lastTicker = item;
        }
      });
    });

    this.loadingEnd();
  }

  getMarketsByCoinSymbol(coinSymbol: string) {
    return Array.from(this.marketsMap.values()).filter(o => {
      return o.spec.base === coinSymbol;
    });
  }

  @action
  async createCCXTIns() {
    this.ccxtIns = await new ccxt[this.exchange](this.createCCXTOption);
  }

  @computed get allMarkets() {
    return Array.from(this.marketsMap.values())
  }

  getSnapShoot(): this {
    const obj = super.getSnapShoot();
    delete obj.ccxtIns;
    return obj;
  }


}
