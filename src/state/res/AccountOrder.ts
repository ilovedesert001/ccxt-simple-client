import { action, computed, observable, runInAction } from "mobx";
import { BaseResModel } from "./Base";
import { OrderModel } from "../../model/models";
import _ from "lodash";
import { Account } from "./Account";
import { Market } from "./Market";
import { CommonSubLs } from "../../Util";

export class AccountOrder extends BaseResModel<Account> {
  map = observable.map<string, OrderModel>({}, { name: "orderMap" });

  @observable market: Market = null;

  constructor(root, parent, market: Market) {
    super(root, parent);
    this.market = market;
  }

  get ccxtIns() {
    return this.parent.ccxtIns;
  }

  @computed
  get all() {
    let items = Array.from(this.map.values());
    items = _.orderBy(items, ["timestamp"], ["desc"]);
    return items;
  }

  @computed
  get activeOrders() {
    return this.all.filter(o => o.status === "open");
  }

  @action
  async updateRes() {
    this.loadingStart();
    const market = this.market;
    const symbol = market.spec.symbol;
    let orders: OrderModel[] = await this.ccxtIns.fetchOrders(symbol);
    runInAction(() => {
      orders = _.orderBy(orders, "timestamp", ["desc"]);
      const ordersObj = _.keyBy(orders, "id");
      this.map.merge(ordersObj);
      this.createLatestClosedOrderFromLs();
      this.loadingEnd();
    });
  }

  // pal - profit and loss

  @observable latestClosedOrder = null; // Need for calculate pal
  //Orders involved in profit and loss calculations  - from latestClosedOrder(Not included) to latest order
  @computed
  get palOrders() {
    let orders = this.all;
    if (this.latestClosedOrder) {
      orders = _.take(orders, _.indexOf(orders, this.latestClosedOrder));
    }
    return orders;
  }

  @action
  setLatestClosedOrder(order: OrderModel) {
    this.latestClosedOrder = order;
    this.lsLatestClosedOrdersSet(order);
  }

  lsLatestClosedOrders = new CommonSubLs(
    this.store.config.ls,
    `LatestClosedOrders`
  );

  lsGetOrderKey = () => {
    const lsKey = `${this.market.parent.exchange}-${this.parent.name}-${this.market.spec.symbol}`;
    return lsKey;
  };

  lsLatestClosedOrdersSet = (order: OrderModel) => {
    const base = this.lsLatestClosedOrders.lsGet("orders", {});
    const lsKey = this.lsGetOrderKey();
    const lsObj = {
      marketSymbol: this.market.spec.symbol,
      orderId: order.id,
      account: this.parent.name
    } as ILsLatestClosedOrder;
    base[lsKey] = lsObj;
    this.lsLatestClosedOrders.lsSet("orders", base);
  };

  lsLatestClosedOrdersDelete = () => {
    const base = this.lsLatestClosedOrders.lsGet("orders", {});
    const lsKey = this.lsGetOrderKey();
    delete base[lsKey];
    this.lsLatestClosedOrders.lsSet("orders", base);
  };

  createLatestClosedOrderFromLs = () => {
    const base = this.lsLatestClosedOrders.lsGet("orders", {});
    const lsKey = this.lsGetOrderKey();
    const lsObj = base[lsKey] as ILsLatestClosedOrder;
    if (lsObj) {
      this.latestClosedOrder = this.map.get(lsObj.orderId);
    }
  };
}

export interface ILsLatestClosedOrder {
  marketSymbol: string;
  orderId: string;
  account: string;
}
