import React, {useCallback, useEffect} from "react";
import {observer} from "mobx-react-lite";
import {TimeAgo, UpdateBtn} from "../Util";
import {Card} from "antd";
import "./index.scss";
import {CardProps} from "antd/lib/card";
import classNames from "classnames";
import _ from "lodash";
import {BaseResModel} from "../../state/res/Base";

export const UpdatableCard = observer(function UpdatableCard(
  props: Partial<CardProps> & {
    updatableRes: Partial<BaseResModel>;
    noContentPadding?: boolean;
    updateImmediately?: boolean;
  }
) {
  const {
    updatableRes,
    noContentPadding = true,
    updateImmediately = true
  } = props;

  const doUpdate = useCallback(async () => {
    try {
      await updatableRes.updateRes();
    } catch (e) {
      console.warn("updatableRes failed", e);
    }
  }, [updatableRes]);

  useEffect(() => {
    if (updateImmediately) {
      doUpdate();
    }
  }, []);

  const cardProps = _.omit(props, [
    "updatableRes",
    "noContentPadding",
    "updateImmediately"
  ]);

  return (
    <Card
      {...cardProps}
      title={
        <div className={"titleWithUpdateTime"}>
          <div>{props.title}</div>
          <div className={"updateTime"}>
            <TimeAgo time={updatableRes.lastUpdateTime} />
          </div>
        </div>
      }
      className={classNames(
        "UpdatableCard",
        {
          noContentPadding: noContentPadding
        },
        cardProps.className
      )}
      size="small"
      extra={
        <div>
          <UpdateBtn
            onClick={() => {
              doUpdate();
            }}
            loading={updatableRes.loading}
          />
        </div>
      }
    >
      {cardProps.children}
    </Card>
  );
});
