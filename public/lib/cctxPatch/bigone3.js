window.patch_bigone3 = function() {
  const cctx = window.ccxt;
  const name = "bigone3";

  const Original = cctx[name];

  class Enhanced extends Original {
    enhanced = true;

    async fetchOrders(...args) {
      const [symbol, since, limit = 200, params] = args;
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
        let orders = data1.concat(data2);
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

  ccxt[name] = Enhanced;
};
