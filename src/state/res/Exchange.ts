import { action, computed, observable, runInAction } from "mobx";
import { BaseResModel } from "./Base";
import { Market } from "./Market";
import { Exchanges } from "./Exchanges";
import _ from "lodash";
import { BalanceModel, TickerModel } from "../../model/models";

export class Exchange extends BaseResModel<Exchanges> {
  marketsMap = observable.map<string, Market>({}, { name: "marketsMap" });

  constructor(root, parent) {
    super(root, parent);

    window["bigone"] = this;
  }

  @observable ccxtIns = null as ccxt.Exchange;

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
      let items = await this.ccxtIns.fetchMarkets();
      this.fetchedMarkets = true;
      runInAction(() => {
        items.forEach(item => {
          const res = new Market(this.store, this, item);
          this.marketsMap.set(item.symbol, res);
        });
      });
    }

    let items = await this.ccxtIns.fetchTickers();
    runInAction(() => {
      _.each(items, (item: TickerModel) => {
        const market = this.marketsMap.get(item.symbol);
        if (market) {
          market.lastTicker = item;
        }
      });
    });

    this.loadingEnd();
  }

  getMarketsByCoinSymbol(coinSymbol: string) {
    return this.allMarkets.filter(o => {
      return o.spec.base === coinSymbol;
    });
  }
  getMarketsByCoinSymbolFilterActive(coinSymbol: string) {
    return this.allMarkets.filter(o => {
      return o.spec.base === coinSymbol;
    });
  }

  @action
  async createCCXTIns() {
    this.ccxtIns = await new window.ccxt[this.exchange](this.createCCXTOption);
  }

  @computed get allMarkets() {
    return Array.from(this.marketsMap.values());
  }

  @computed get allEnabledMarkets() {
    return this.allMarkets.filter(o => o.spec.active);
  }

  getQuoteValue(balance: BalanceModel) {
    const markets = this.getMarketsByCoinSymbolFilterActive(balance.base);
    return markets
      .filter(o => o.lastPrice && o.spec.base === balance.base)
      .map(market => {
        return {
          symbol: market.spec.symbol,
          quote: market.spec.quote,
          base: balance.base,
          value: balance.total * market.lastPrice
        };
      });
  }

  getSnapShoot(): this {
    const obj = super.getSnapShoot();
    delete obj.ccxtIns;
    return obj;
  }
}
