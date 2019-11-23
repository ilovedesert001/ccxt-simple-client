import { action, observable, runInAction } from "mobx";
import { BaseResModel } from "../Base";
import { Market } from "../Market";
import { OHLCVModel } from "../../../model/models";

export class Candlestick extends BaseResModel<Market> {
  get market() {
    return this.parent;
  }

  get ccxtIns() {
    return this.parent.parent.ccxtIns;
  }

  @observable ohlcv_arr: OHLCVModel[] = [];

  @action
  async updateRes() {
    this.loadingStart();
    const market = this.market;
    const arr = await this.ccxtIns.fetchOHLCV(
      market.spec.symbol,
      "1d",
      null,
      500
    );
    runInAction(() => {
      this.ohlcv_arr = arr.map(o => {
        return {
          time: o[0],
          open: o[1],
          high: o[2],
          close: o[3],
          low: o[4],
          volume: o[5]
        } as OHLCVModel;
      });
    });
    this.loadingEnd();
  }
}
