import { action, observable, runInAction } from "mobx";
import { BaseResModel } from "./Base";
import { eTickType, TradeModel } from "../../model/models";
import { Market } from "./Market";
import _ from "lodash";
import { forTwo } from "../../Util";

export class RecentTrade extends BaseResModel<Market> {
  get market() {
    return this.parent;
  }

  get ccxtIns() {
    return this.parent.parent.ccxtIns;
  }

  @observable trades: TradeModel[] = [];

  @action
  async updateRes() {
    this.loadingStart();
    const market = this.market;
    let trades = <TradeModel[]>await this.ccxtIns.fetchTrades(market.spec.symbol);

    runInAction(() => {
      trades = _.orderBy(trades, "timestamp", ["desc"]);
      forTwo(_.reverse(trades), (o1, o2) => {
        let tick = eTickType.zeroMinusTick;

        if (o2.price > o1.price) {
          tick = eTickType.plusTick;
        } else if (o2.price < o1.price) {
          tick = eTickType.minusTick;
        } else if (o2.price === o1.price) {
          if (o1.tick === eTickType.plusTick || o1.tick === eTickType.zeroPlusTick) {
            tick = eTickType.zeroPlusTick;
          } else {
            tick = eTickType.zeroMinusTick;
          }
        }
        o2.tick = tick;
      });
      this.trades = _.orderBy(trades, "timestamp", ["desc"]);

      // if (this.market.lastTicker) {
      //   this.market.lastTicker.close = this.trades[0].price;
      // }
    });

    this.loadingEnd();
  }

  testAddTrades() {
    const createTrade = () => {
      const time = new Date();
      const trade = {
        timestamp: time.getTime(),
        datetime: "2019-11-20T15:54:01.000Z",
        symbol: this.market.spec.symbol,
        id: _.uniqueId("tradeId_"),
        type: "limit",
        side: "sell",
        price: 0.01659,
        amount: 1065 + Math.random() * 300,
        cost: 17.66835,
        info: {
          id: 169799562,
          price: "0.01659",
          amount: "1065",
          taker_side: "ASK",
          inserted_at: "2019-11-20T15:54:01Z",
          created_at: "2019-11-20T15:54:01Z"
        },
        tick: "plusTick"
      } as TradeModel;
      return trade;
    };

    const createTrades = (): TradeModel[] => {
      const num = Math.random() * 5;
      const trades = [];
      for (let i = 0; i < num; i++) {
        trades.push(createTrade());
      }
      return trades;
    };

    window.setInterval(() => {
      this.trades.unshift(...createTrades());
    }, 1000);
  }
}
