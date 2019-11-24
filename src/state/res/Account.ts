import { action, observable } from "mobx";
import { BaseResModel } from "./Base";
import { Exchange } from "./Exchange";
import { Accounts } from "./Accounts";
import { Balance } from "./Balance";
import { OrderModel } from "../../model/models";
import { AccountOrder } from "./AccountOrder";
import { Market } from "./Market";

export class Account extends BaseResModel<Accounts> {
  constructor(root, parent) {
    super(root, parent);

    this.balances = new Balance(root, this);
  }

  @observable ccxtIns = null as ccxt.Exchange; //共享market， 但是私有api 通过自己的 cctx 请求
  @observable name = "bigone3"; // account 唯一名字，不能重复

  @observable exchange: Exchange = null;

  @observable createCCXTOption = {};

  @action
  async updateRes() {
    this.loadingStart();

    this.loadingEnd();
  }

  @action
  async createCCXTIns(exchange: Exchange) {
    this.exchange = exchange;
    const ccxtOptions = Object.assign(
      {},
      exchange.createCCXTOption,
      this.createCCXTOption
    );
    this.ccxtIns = await new window.ccxt[exchange.exchange](ccxtOptions);
  }

  @observable balances: Balance;

  accountOrdersMap = observable.map<string, AccountOrder>(
    {},
    { name: "accountOrdersMap" }
  );

  @action createOrUpdateOrdersByMarket(market: Market) {
    const symbol = market.spec.symbol;
    let accountOrder = this.accountOrdersMap.get(symbol);
    if (!accountOrder) {
      accountOrder = new AccountOrder(this.store, this, market);
      this.accountOrdersMap.set(symbol, accountOrder);
    }
    return accountOrder;
  }

  safeGetAccountOrder(market: Market) {
    return this.createOrUpdateOrdersByMarket(market);
  }

  //计算花出去的钱
  computeOutMoneyByHistory(orders: OrderModel[]) {
    let toCompute = orders.filter(o => {
      return o.filled > 0; //才是真正执行过的订单
    });

    const sum = toCompute.reduce((sum, order) => {
      let money = 0;

      if (order.type === "limit") {
        money = order.price * order.amount;
      } else {
        money = order.filled;
      }

      if (order.side === "sell") {
        money *= -1;
      }
      return sum + money;
    }, 0);
    return sum;
  }

  computeCurrentValue(market: Market) {
    const lastPrice = market.lastPrice;
    const currentValue =
      this.balances.map.get(market.spec.base).total * lastPrice;
    return currentValue;
  }

  computeProfitAndRateByMarketPrice(market: Market) {
    const accountOrder = this.safeGetAccountOrder(market);
    const outValue = this.computeOutMoneyByHistory(accountOrder.palOrders);
    const currentValue = this.computeCurrentValue(market);
    return {
      profit: currentValue - outValue,
      rate: (currentValue - outValue) / outValue
    };
  }

  computeOrderBookValue(market: Market) {
    const currentSize = this.balances.map.get(market.spec.base).total;

    const bids = market.orderBook.bids;

    let sellValue = 0; // can be sold

    let calculateSize = 0;

    for (let i = 0; i < bids.length; i++) {
      const b = bids[i];
      calculateSize += b.size;

      if (calculateSize < currentSize) {
        sellValue += b.size * b.price;
      } else {
        const leftSize = currentSize - (calculateSize - b.size);
        sellValue += leftSize * b.price;
        break;
      }
    }
    return sellValue;
  }

  computeProfitAndRateByOrderBook(market: Market) {
    const accountOrder = this.safeGetAccountOrder(market);
    const currentValue = this.computeOrderBookValue(market);
    const outValue = this.computeOutMoneyByHistory(accountOrder.palOrders);

    return {
      profit: currentValue - outValue,
      rate: (currentValue - outValue) / outValue
    };
  }

  getSnapShoot(): this {
    const obj = super.getSnapShoot();
    delete obj.ccxtIns;
    delete this.exchange;
    return obj;
  }
}
