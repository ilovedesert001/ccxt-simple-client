import { ExchangeOriginalClass } from "./util";
import _ from "lodash";

export function init() {
  const cctx = window.ccxt;

  const name = "bigone3";

  const Original: typeof ccxt.Exchange = cctx[name];

  class Enhanced extends ExchangeOriginalClass {
    constructor(...args) {
      super();
      this["__proto__"] = new Original(...args);
    }
    enhanced = true;

    async fetchOrders(...args) {
      const [symbol, since, limit, params] = args;
      return Promise.all([
        super.fetchOrders(
          symbol,
          since,
          limit,
          Object.assign(
            {},
            {
              state: "PENDING"
            },
            params
          )
        ),
        super.fetchOrders(
          symbol,
          since,
          limit,
          Object.assign(
            {},
            {
              state: "CLOSED"
            },
            params
          )
        )
      ]).then(([data1, data2]) => {
        let orders = [];
        orders.forEach(o => {
          if (o.price) {
            o.type = "limit";
          } else {
            o.type = "market";
          }
        });
        return orders;
      });
    }
  }

  cctx[name] = Enhanced;
}
