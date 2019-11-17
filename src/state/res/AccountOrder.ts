import {action, computed, observable} from "mobx";
import {BaseResModel} from "./Base";
import {eOrderStatus, eOrderType, IOrderRes} from "../../model/models";
import _ from "lodash";
import {Account} from "./Account";
import {Market} from "./Market";

export class AccountOrder extends BaseResModel<Account> {
  map = observable.map<string, IOrderRes>({}, {name: "orderMap"});

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
    return this.all.filter(o => o.status === eOrderStatus.open);
  }

  @action
  async updateRes() {
    this.loadingStart();

    const market = this.market;
    const symbol = market.spec.symbol;

    await Promise.all([
      this.ccxtIns.fetchOrders(symbol, null, 100, {
        state: "PENDING"
      }),
      this.ccxtIns.fetchOrders(symbol, null, 100, {
        state: "CLOSED"
      })
    ]).then(([data1, data2]) => {
      let orders: IOrderRes[] = [...data1, ...data2];

      //TODO 只适用于 bigone3
      orders.forEach(o => {
        if (o.price) {
          o.type = eOrderType.limit;
        } else {
          o.type = eOrderType.market;
        }
      });

      orders = _.orderBy(orders, "timestamp", ["desc"]);
      const ordersObj = _.keyBy(orders, "id");
      this.map.merge(ordersObj);
      this.loadingEnd();
    });
  }
}
