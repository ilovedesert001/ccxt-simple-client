import _ from "lodash";
import React from "react";
import {observer, Observer} from "mobx-react-lite";
import {IMarketRes} from "../model/models";
import {format, isToday} from "date-fns";
import {ColumnProps} from "antd/lib/table";
import {Button} from "antd";
import ReactTimeAgo from "timeago-react";

export const mCol = function (
  column: Partial<ColumnProps<any> & { templateRender: any }>
): ColumnProps<any> {
  column.title = column.title || _.capitalize(column.dataIndex);
  column.key = column.key || column.dataIndex;

  column.width = column.width || 200;

  if (!column.render) {
    column.render = (val, row) => {
      return (
        <Ob
          r={() => {
            const val = row[column.dataIndex];
            if (column.templateRender) {
              return column.templateRender(row, val);
            } else {
              return <div>{val}</div>;
            }
          }}
        />
      );
    };
  }

  return column as ColumnProps<any>;
};

export function Ob(props: { r: Function }) {
  return <Observer render={props.r as any}/>;
}

export const FormatValue = observer(function FormatPrice(props: {
  val: number;
  market: IMarketRes;
}) {
  const {val, market} = props;
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
  const {val, len = 4} = props;
  const v = _.ceil(val * 100, len);
  return <span>{v} %</span>;
});

export const FormatTimeAuto = (props: { val: number | Date }) => {
  const {val} = props;
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

export const TimeAgo = observer(function (props: { time: number | Date }) {

  let time = props.time;

  if (_.isDate(props.time)) {
    return <ReactTimeAgo datetime={props.time} locale="en_US"/>;
  } else {
    return time as any;
  }

});
