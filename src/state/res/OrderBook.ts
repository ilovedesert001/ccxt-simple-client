import { action, observable } from "mobx";
import { BaseResModel } from "./Base";
import { OrderBookModel } from "../../model/models";
import { Market } from "./Market";

export class OrderBook extends BaseResModel<Market> {
  get market() {
    return this.parent;
  }

  get ccxtIns() {
    return this.parent.parent.ccxtIns;
  }

  @observable asks: OrderBookModel[] = [];
  @observable bids: OrderBookModel[] = [];

  transferToOrderBookRes = (originItem: number[]) => {
    return {
      price: originItem[0],
      size: originItem[1],
      accumulateSize: originItem[1]
      // side:,
    } as OrderBookModel;
  };

  @action
  async updateRes() {
    this.loadingStart();
    const market = this.market;
    await this.ccxtIns.fetchOrderBook(market.spec.symbol).then(data => {
      this.bids = data.bids.map(this.transferToOrderBookRes);
      this.asks = data.asks.map(this.transferToOrderBookRes);
    });
    this.loadingEnd();
  }
}
