import { action, computed, observable } from "mobx";
import { BaseResModel } from "./Base";
import { OrderModel } from "../../model/models";
import _ from "lodash";
import { Account } from "./Account";
import { Market } from "./Market";

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
    orders = _.orderBy(orders, "timestamp", ["desc"]);
    const ordersObj = _.keyBy(orders, "id");
    this.map.merge(ordersObj);
    this.loadingEnd();
  }
}
