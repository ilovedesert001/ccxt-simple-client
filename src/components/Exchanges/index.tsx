import React from "react";
import {observer} from "mobx-react-lite";
import {mCol, Ob} from "../Util";
import {Table} from "antd";
import "./index.scss";
import {UpdatableCard} from "../UpdatableCard";
import {useStore} from "../../state";
import {Exchange} from "../../state/res/Exchange";
import {Link} from "react-router-dom";

export const Exchanges = observer(function Exchanges(props: {}) {
  const {exchanges} = useStore();

  const list = exchanges.all;

  return (
    <div className={"Exchanges"} style={{padding: 24}}>
      <UpdatableCard title={<div>Exchanges</div>} updatableRes={exchanges}>
        <Table
          size={"small"}
          dataSource={list}
          rowKey={"exchange"}
          columns={[
            mCol({
              title: 'Id',
              dataIndex: "exchange",
              templateRender: (row: Exchange, v) => (
                <Ob
                  r={() => {
                    return (
                      <div>
                        <Link to={`/exchange/${row.exchange}`}>{v}</Link>
                      </div>
                    );
                  }}
                />
              )
            }),
          ]}
        />
      </UpdatableCard>
    </div>
  );
});
