import { action, computed, observable } from "mobx";
import { BaseResModel } from "./Base";
import { Exchange } from "./Exchange";
import { MarketSpecModel, TickerModel } from "../../model/models";
import { RecentTrade } from "./RecentTrade";
import { OrderBook } from "./OrderBook";
import { Candlestick } from "./market/Candlestick";

export class Market extends BaseResModel<Exchange> {
  @observable recentTrades: RecentTrade;
  @observable orderBook: OrderBook;
  @observable candlestick: Candlestick;
  @observable spec: MarketSpecModel = null;

  @observable lastTicker = null as TickerModel;

  constructor(root, parent, spec: MarketSpecModel) {
    super(root, parent);
    this.spec = spec;
    this.recentTrades = new RecentTrade(root, this);
    this.orderBook = new OrderBook(root, this);
    this.candlestick = new Candlestick(root, this);
  }

  @action
  async updateRes() {
    this.loadingStart();
    await this.recentTrades.updateRes();
    await this.orderBook.updateRes();
    await this.candlestick.updateRes();
    this.loadingEnd();
  }

  @computed get lastTrade() {
    return this.recentTrades.trades[0];
  }

  //market price
  @computed get lastPrice() {
    if (this.lastTicker) {
      return this.lastTicker.close;
    } else {
      return 0;
    }
  }
}
