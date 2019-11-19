import _ from "lodash";
import React from "react";
import { observer, Observer } from "mobx-react-lite";
import { eTickType, MarketSpecModel } from "../model/models";
import { format, isToday } from "date-fns";
import { ColumnProps, TableProps } from "antd/lib/table";
import { Button, Icon, Table } from "antd";
import ReactTimeAgo from "timeago-react";

export function MobTable<T>(props: TableProps<T>) {
  const columns = props.columns.map(column => {
    column.title = column.title || _.capitalize(column.dataIndex);
    column.key = column.key || column.dataIndex;

    column.width = column.width || 200;

    if (column.render) {
      const originalRender = column.render;
      column.render = (text, row, index) => {
        return (
          <Ob
            r={() => {
              const val = row[column.dataIndex];
              return originalRender(val, row, index);
            }}
          />
        );
      };
    } else {
      column.render = (text, row) => {
        return (
          <Ob
            r={() => {
              const val = row[column.dataIndex];
              return val;
            }}
          />
        );
      };
    }
    return column as ColumnProps<any>;
  });
  return <Table<T> {...props} columns={columns} />;
}

export function Ob(props: { r: Function }) {
  return <Observer render={props.r as any} />;
}

export const FormatValue = observer(function FormatPrice(props: {
  val: number;
  market: MarketSpecModel;
}) {
  const { val, market } = props;
  let len = 8;
  if (market.quote === "USDT") {
    len = 2;
  }
  const v = _.ceil(val, len);
  return (
    <span>
      {v} {market.quote}
    </span>
  );
});

export const FormatPercentage = observer(function FormatPrice(props: {
  val: number;
  len?: number;
}) {
  const { val, len = 4 } = props;
  const v = _.ceil(val * 100, len);
  return <span>{v} %</span>;
});

export const FormatTimeAuto = (props: { val: number | Date }) => {
  const { val } = props;
  let formatStr = `yyyy-MM-dd HH:mm:ss`;
  if (isToday(val)) {
    formatStr = `HH:mm:ss`;
  }
  return format(val, formatStr) as any;
};

export const UpdateBtn = (props: { onClick: any; loading: boolean }) => {
  return (
    <Button
      type={"primary"}
      shape="circle"
      icon="sync"
      onClick={props.onClick}
      loading={props.loading}
    />
  );
};

export const TimeAgo = observer(function(props: { time: number | Date }) {
  let time = props.time;

  if (_.isDate(props.time)) {
    return <ReactTimeAgo datetime={props.time} locale="en_US" />;
  } else {
    return time as any;
  }
});

export const TickItem = observer(function TickItem(props: { tick: eTickType }) {
  const { tick } = props;

  let icon = <Icon type="arrow-up" />;

  switch (tick) {
    case eTickType.plusTick:
      icon = <Icon type="arrow-up" />;
      break;
    case eTickType.zeroPlusTick:
      icon = <Icon type="caret-up" />;
      break;
    case eTickType.minusTick:
      icon = <Icon type="arrow-down" />;
      break;
    case eTickType.zeroMinusTick:
      icon = <Icon type="caret-down" />;
      break;
  }

  return <div className={`icon ${tick}`}>{icon}</div>;
});

export const NumberSeparateFormat = observer(
  (props: { num: number; fixed: number }) => {
    const { fixed, num } = props;

    const numFixed = fixed ? num.toFixed(fixed) : String(num);

    const valid = String(Number(numFixed));
    const zero = numFixed.substr(valid.length);

    return (
      <span className={"Nf"}>
        {valid}
        <span className={"invalidSection"}>{zero}</span>
      </span>
    );
  }
);

export const FormatBase = observer(function FormatBase(props: {
  val: number;
  spec: MarketSpecModel;
}) {
  const { val, spec } = props;
  const fixedNum = spec.precision.base || spec.precision.amount;
  return <NumberSeparateFormat num={val} fixed={fixedNum} />;
});

export const FormatQuote = observer(function FormatQuote(props: {
  val: number;
  spec: MarketSpecModel;
}) {
  const { val, spec } = props;
  const fixedNum = spec.precision.quote || spec.precision.price;
  return <NumberSeparateFormat num={val} fixed={fixedNum} />;
});
