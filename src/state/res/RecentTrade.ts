import {action, observable} from "mobx";
import {BaseResModel} from "./Base";
import {eTickType, ITradeRes} from "../../model/models";
import {Market} from "./Market";
import _ from "lodash";
import {forTwo} from "../../Util";

export class RecentTrade extends BaseResModel<Market> {
  get market() {
    return this.parent;
  }

  get ccxtIns() {
    return this.parent.parent.ccxtIns;
  }

  @observable trades: ITradeRes[] = [];

  @action
  async updateRes() {
    this.loadingStart();
    const market = this.market;
    await this.ccxtIns.fetchTrades(market.spec.symbol).then(data => {
      const trades = _.orderBy(data, "timestamp", ["desc"]) as ITradeRes[];

      forTwo(_.reverse(trades), (o1, o2) => {
        let tick = eTickType.zeroMinusTick;

        if (o2.price > o1.price) {
          tick = eTickType.plusTick;
        } else if (o2.price < o1.price) {
          tick = eTickType.minusTick;
        } else if (o2.price === o1.price) {
          if (
            o1.tick === eTickType.plusTick ||
            o1.tick === eTickType.zeroPlusTick
          ) {
            tick = eTickType.zeroPlusTick;
          } else {
            tick = eTickType.zeroMinusTick;
          }
        }
        o2.tick = tick;
      });

      this.trades = _.orderBy(data, "timestamp", ["desc"]);
    });
    this.loadingEnd();
  }
}
