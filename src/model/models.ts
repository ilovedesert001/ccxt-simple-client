export enum eSide {
  buy = "buy",
  sell = "sell",
  both = "both"
}

export enum eOrderType {
  limit = "limit",
  market = "market"
}

export interface IBalanceRes {
  key: string;
  free: number;
  used: number;
  total: number;
}

export interface IMarketRes {
  symbol: string;
  quote: string;
  precision: { amount: number; price: number };
  active: boolean;
  id: string;
  baseId: string;
  quoteId: string;
  limits: {
    amount: { min: number; max: number };
    cost: {};
    price: { min: number; max: number };
  };
  base: string;
  info: {
    min_quote_value: string;
    base_asset: { symbol: string; name: string; id: string };
    name: string;
    id: string;
    quote_scale: number;
    quote_asset: { symbol: string; name: string; id: string };
    base_scale: number;
  };
}

export interface ITickerRes {
  symbol: string;
  last: number;
  change: number;
  askVolume: number;
  datetime: string;
  high: number;
  low: number;
  ask: number;
  bidVolume: number;
  bid: number;
  baseVolume: number;
  close: number;
  open: number;
  timestamp: number;
  info: {
    volume: string;
    asset_pair_name: string;
    high: string;
    low: string;
    ask: { quantity: string; order_count: number; price: string };
    daily_change: string;
    bid: { quantity: string; order_count: number; price: string };
    close: string;
    open: string;
  };
}

export enum eOrderStatus {
  open = "open",
  closed = "closed",
  canceled = "canceled"
}

export interface IOrderRes {
  symbol: string;
  datetime: string;
  side: eSide;
  type: eOrderType;
  amount: number;
  cost: number;
  price: number;
  filled: number;
  id: string;
  remaining: number;
  timestamp: number;
  status: eOrderStatus;
  info?: {
    asset_pair_name: string;
    amount: string;
    side: string;
    updated_at: string;
    price: string;
    avg_deal_price: string;
    created_at: string;
    id: number;
    state: string;
    filled_amount: string;
  };
}

export enum eTickType {
  plusTick = "plusTick",
  zeroPlusTick = "ZeroPlusTick",
  minusTick = "minusTick",
  zeroMinusTick = "ZeroMinusTick"
}

export interface ITradeRes {
  symbol: string;
  datetime: string;
  side: eSide;
  amount: number;
  cost: number;
  price: number;
  id: string;
  type: string;
  timestamp: number;
  tick: eTickType;
  info: {
    amount: string;
    price: string;
    created_at: string;
    taker_side: string;
    id: number;
    inserted_at: string;
  };
}

export interface IOrderBookRes {
  price: number;
  size: number;
  accumulateSize: number; //累计（吃到这里所需要的数量）
  // side:eSide;
}
