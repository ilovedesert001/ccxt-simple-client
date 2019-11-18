import { action, computed, observable } from "mobx";
import { BaseResModel } from "./Base";
import { Exchange } from "./Exchange";
import { MarketSpecModel, TickerModel } from "../../model/models";
import { RecentTrade } from "./RecentTrade";
import { OrderBook } from "./OrderBook";

export class Market extends BaseResModel<Exchange> {
  @observable recentTrades: RecentTrade; //近期交易
  @observable orderBook: OrderBook; //买卖盘
  @observable spec: MarketSpecModel = null;

  @observable lastTicker = null as TickerModel;

  constructor(root, parent, spec: MarketSpecModel) {
    super(root, parent);
    this.spec = spec;
    this.recentTrades = new RecentTrade(root, this);
    this.orderBook = new OrderBook(root, this);
  }

  @action
  async updateRes() {
    this.loadingStart();
    await this.recentTrades.updateRes();
    await this.orderBook.updateRes();
    this.loadingEnd();
  }

  @computed get lastTrade() {
    return this.recentTrades.trades[0];
  }

  //市场价
  @computed get lastPrice() {
    if (this.lastTrade) {
      return this.lastTrade.price;
    } else {
      return 0;
    }
  }
}
