import {action, observable} from "mobx";
import {BaseResModel} from "./Base";
import {Exchange} from "./Exchange";
import {Accounts} from "./Accounts";
import {Balance} from "./Balance";
import {IOrderRes} from "../../model/models";
import {AccountOrder} from "./AccountOrder";
import {Market} from "./Market";

export class Account extends BaseResModel<Accounts> {
  constructor(root, parent) {
    super(root, parent);

    this.balances = new Balance(root, this);
  }

  @observable ccxtIns = null as any; //共享market， 但是私有api 通过自己的 cctx 请求
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
    this.ccxtIns = await new ccxt[exchange.exchange](ccxtOptions);
  }

  @observable balances: Balance;

  accountOrdersMap = observable.map<string, AccountOrder>(
    {},
    {name: "accountOrdersMap"}
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
  computeOutMoneyByHistory(orders: IOrderRes[]) {
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

  computeProfitAndRate(market: Market) {
    const accountOrder = this.safeGetAccountOrder(market);
    const outValue = this.computeOutMoneyByHistory(accountOrder.all);
    const currentValue = this.computeCurrentValue(market);
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
