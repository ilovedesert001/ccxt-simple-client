import React from "react";
import {observer} from "mobx-react-lite";
import {MobTable} from "../Util";
import "./index.scss";
import {UpdatableCard} from "../UpdatableCard";
import {useStore} from "../../state";
import {Exchange} from "../../state/res/Exchange";
import {Link} from "react-router-dom";

export const Exchanges = observer(function Exchanges(props: {}) {
  const { exchanges } = useStore();

  const list = exchanges.all;

  return (
    <div className={"Exchanges"} style={{ padding: 24 }}>
      <UpdatableCard title={<div>Exchanges</div>} updatableRes={exchanges}>
        <MobTable<Exchange>
          size={"small"}
          dataSource={list}
          rowKey={"exchange"}
          columns={[
            {
              title: "Id",
              dataIndex: "exchange",
              render: (v, row) => (
                <div>
                  <Link to={`/exchange/${row.exchange}`}>{v}</Link>
                </div>
              )
            }
          ]}
        />
      </UpdatableCard>
    </div>
  );
});
