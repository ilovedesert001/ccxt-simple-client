import React, {useEffect, useRef} from "react";
import {observer, useLocalStore} from "mobx-react-lite";
import "./index.scss";
import {OHLCVModel} from "../../model/models";
import {UpdatableCard} from "../UpdatableCard";
import {Market} from "../../state/res/Market";
import * as LightweightChart from "lightweight-charts";
import {autorun} from "mobx";

const { createChart } = LightweightChart;

export const TradingView = observer(function TradingView(props: {
  market: Market;
}) {
  const { market } = props;

  const el = useRef(null as HTMLDivElement);

  const state = useLocalStore(() => ({
    chart: null as LightweightChart.IChartApi,
    candleSeries: null as LightweightChart.ISeriesApi<"Candlestick">,
    volumeSeries: null as LightweightChart.ISeriesApi<"Histogram">,

    updateChart(data: OHLCVModel[]) {
      const chartWidth = 800;
      const chartHeight = 550;

      if (!state.chart) {
        const chart = (state.chart = createChart(el.current, {
          width: chartWidth,
          height: chartHeight
        }));
        chart.applyOptions({
          layout: {
            backgroundColor: "#000000",
            textColor: "rgba(255, 255, 255, 0.9)",
            fontSize: 16
          },
          grid: {
            vertLines: {
              color: "rgba(197, 203, 206, 0.5)"
            },
            horzLines: {
              color: "rgba(197, 203, 206, 0.5)"
            }
          },
          crosshair: {
            mode: 0
          },
          priceScale: {
            borderColor: "rgba(197, 203, 206, 0.8)"
          },
          timeScale: {
            borderColor: "rgba(197, 203, 206, 0.8)"
          }
        });

        state.candleSeries = chart.addCandlestickSeries({
          upColor: "rgba(255, 144, 0, 1)",
          downColor: "#000",
          borderDownColor: "rgba(255, 144, 0, 1)",
          borderUpColor: "rgba(255, 144, 0, 1)",
          wickDownColor: "rgba(255, 144, 0, 1)",
          wickUpColor: "rgba(255, 144, 0, 1)"
        });

        // let candleData = [
        //   {
        //     time: "2018-10-19",
        //     open: 180.34,
        //     high: 180.99,
        //     low: 178.57,
        //     close: 179.85
        //   }
        // ];
        //
        // let time = new Date();
        //
        // candleData.map((o, index) => {
        //   o.time = (time.getTime() + index * 1500) as any;
        // });
        // candleSeries.setData(candleData);

        state.volumeSeries = chart.addHistogramSeries({
          color: "#26a69a",
          lineWidth: 2,
          priceFormat: {
            type: "volume"
          },
          overlay: true,
          scaleMargins: {
            top: 0.8,
            bottom: 0
          }
        });

        // volumeSeries.setData([
        //   {
        //     time: "2019-05-22",
        //     value: 19103293.0,
        //     color: "rgba(0, 150, 136, 0.8)"
        //   },
        //   { time: "2019-05-23", value: 11707083.0, color: "rgba(255,82,82, 0.8)" }
        // ]);
      }

      const candleSeriesData = data.map(o => {
        const d = {
          time: o.time / 1000,
          open: o.open,
          high: o.high,
          low: o.low,
          close: o.close
        };

        return d;
      });
      state.candleSeries.setData(candleSeriesData as any);

      const volumeSeriesData = data.map(o => {
        const d = {
          time: o.time / 1000,
          value: o.volume
        };

        return d;
      });
      state.volumeSeries.setData(volumeSeriesData as any);
    }
  }));

  useEffect(() => {
    const react1 = autorun(() => {
      // console.log("AAAAAAAAAAAAAA",market.candlestick.ohlcv_arr);
      state.updateChart(market.candlestick.ohlcv_arr);
    });

    // chart.subscribeVisibleTimeRangeChange((...args) => {
    //   console.log("AAAAAAA", ...args);
    // });

    return () => {
      react1();
    };
  }, [market.candlestick.ohlcv_arr]);

  return (
    <UpdatableCard
      title={"K Line"}
      className={"Kline"}
      updatableRes={market.candlestick}
    >
      <div style={{ position: "relative" }}>
        <div ref={el} />
      </div>
    </UpdatableCard>
  );
});
