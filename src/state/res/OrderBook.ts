import { action, observable } from "mobx";
import { BaseResModel } from "./Base";
import { OrderBookModel, TradeModel } from "../../model/models";
import { Market } from "./Market";
import _ from "lodash";

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

  test1(intervalTime = 1000) {
    window.setInterval(() => {
      this.market.orderBook.asks[0].price += 1;

      this.market.orderBook.asks[3].price += 1;
    }, intervalTime);
  }
}
