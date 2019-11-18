import _ from "lodash";
import { ExchangeOriginalClass } from "./util";

interface BaseFexMarket {
  pricePrecision: number;
  symbol: string;
  isInverse: boolean;
  riskStep: number;
  maxRiskLimit: number;
  baseCurrency: string;
  initialMargin: number;
  quoteCurrency: string;
  minRiskLimit: number;
  riskLimit: number;
  maintenanceMargin: number;
  enable: boolean;
  baseName: string;
  priceStep: number;
}

export function init() {
  const ccxt = window.ccxt;
  const name = "basefex";
  const Original: typeof ccxt.Exchange = ccxt[name];
  class Enhanced extends ExchangeOriginalClass {
    enhanced = true;
    constructor(...args) {
      super();
      this["__proto__"] = new Original(...args);
    }
    describe() {
      const d = super.describe();
      console.log("aaa", this);
      debugger;
      d.api.public.get.push("instruments");
      return d;
    }

    //用来转换 symbol
    static ccxtSymbolToBaseFexMarket = new Map<string, BaseFexMarket>();
    static baseFexSymbolToCcxtSymbol = new Map<string, string>();

    castMarket(market: BaseFexMarket, params) {
      let _base = this.safeString(market, "baseCurrency");
      let _quote = this.safeString(market, "quoteCurrency");

      //反向合约
      if (market.isInverse) {
        [_base, _quote] = [_quote, _base];
      }

      const ccxtSymbol = `${_base}/${_quote}`;
      Enhanced.ccxtSymbolToBaseFexMarket.set(ccxtSymbol, market);
      Enhanced.baseFexSymbolToCcxtSymbol.set(market.symbol, ccxtSymbol);

      return {
        id: this.safeString(market, "symbol"),
        symbol: this.translateSymbol(_base, _quote),
        base: _base.toUpperCase(),
        quote: _quote.toUpperCase(),
        baseId: _base,
        quoteId: _quote,
        active: this.safeValue(market, "enable"),
        precision: {
          price: this.safeInteger(market, "priceStep")
        },
        limits: {},
        info: market
      };
    }

    fetchMarkets(): Promise<ccxt.Market[]> {
      return super.fetchMarkets().then(data => {
        return data;
      });
    }

    translateBaseFEXSymbol(ccxtSymbol) {
      const market = Enhanced.ccxtSymbolToBaseFexMarket.get(ccxtSymbol);
      let symbol = "";
      if (market) {
        symbol = market.symbol;
      }
      return symbol;
    }

    async fetchTickers() {
      let instruments: ccxt.Ticker[] = await this.publicGetInstruments();
      instruments = instruments.map((instrument: any) => {
        const symbol = Enhanced.baseFexSymbolToCcxtSymbol.get(
          instrument.symbol
        );
        const timestamp = new Date().getTime(); //this.safeInteger (candlestick, 'time');
        return {
          symbol,
          info: instrument,
          timestamp,
          datetime: this.iso8601(timestamp),

          high: instrument.last24hMaxPrice,
          low: instrument.last24hMinPrice,
          bid: undefined,
          bidVolume: undefined,
          ask: undefined,
          askVolume: undefined, // current best ask (sell) amount (may be missing or undefined)
          vwap: undefined,
          open: undefined, // opening price
          close: instrument.latestPrice, // price of last trade (closing price for current period)
          last: instrument.latestPrice, // same as `close`, duplicated for convenience
          previousClose: undefined, // closing price for the previous period
          change: undefined, // absolute change, `last - open`
          percentage: instrument.last24hPriceChange, // relative change, `(change/open) * 100`
          average: undefined, // average price, `(last + open) / 2`
          baseVolume: instrument.volume24hInUsd, // volume of base currency traded for last 24 hours
          quoteVolume: undefined // volume of quote currency traded for last 24 hours
        } as ccxt.Ticker;
      });
      return _.keyBy(instruments, "symbol");
    }

    async fetchOrders(
      symbol = undefined,
      since = undefined,
      limit = undefined,
      params = {}
    ) {
      const query = {
        symbol: this.translateBaseFEXSymbol(symbol),
        limit: limit
      };
      let orders = await this.privateGetOrders({
        query: this.extend(query, this.safeValue(params, "query", {}))
      });
      return this.fnMap(orders, "cast_order", symbol);
    }
  }

  ccxt[name] = Enhanced;
}
