export enum eSide {
  buy = "buy",
  sell = "sell",
  both = "both"
}

export interface BalanceModel extends ccxt.Balance {
  base: string;
}

export interface TickerModel extends ccxt.Ticker {}

export interface OrderModel extends ccxt.Order {}

export enum eTickType {
  plusTick = "plusTick",
  zeroPlusTick = "ZeroPlusTick",
  minusTick = "minusTick",
  zeroMinusTick = "ZeroMinusTick"
}

export interface TradeModel extends ccxt.Trade {
  tick: eTickType;
}

export interface MarketSpecModel extends ccxt.Market {}

export interface OrderBookModel {
  price: number;
  size: number;
  accumulateSize: number; //累计（吃到这里所需要的数量）
  // side:eSide;
}

export interface OHLCVModel {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
