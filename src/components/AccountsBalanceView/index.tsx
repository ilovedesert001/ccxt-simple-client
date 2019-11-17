import React, {useEffect, useRef} from "react";
import {observer, useLocalStore} from "mobx-react-lite";
import {mCol} from "../Util";
import {Button, Form, Input, Modal, Table, Tabs, Tag} from "antd";
import "./index.scss";
import {UpdatableCard} from "../UpdatableCard";
import {useStore} from "../../state";
import {Exchange} from "../../state/res/Exchange";
import {WrappedFormUtils} from "antd/lib/form/Form";
import {Account} from "../../state/res/Account";
import {IBalanceRes} from "../../model/models";
import {CurrentBalance} from "../CurrentBalance";

const {TabPane} = Tabs;

export const AccountsBalanceView = observer(
  function AccountsBalanceView(props: { exchange: Exchange }) {
    const {exchange} = props;

    const {uiStates} = useStore();

    return (
      <Tabs defaultActiveKey="1" onChange={() => {
      }}>
        <TabPane tab="Accounts" key="1">
          <AccountsView exchange={exchange}/>
        </TabPane>
        <TabPane tab="Balance" key="2">
          {uiStates.market && uiStates.account && (
            <CurrentBalance
              account={uiStates.account}
              market={uiStates.market}
            />
          )}
        </TabPane>
      </Tabs>
    );
  }
);

export const AccountsView = observer(function AccountsView(props: {
  exchange: Exchange;
}) {
  const {exchange} = props;

  const {accounts, uiStates} = useStore();

  const formRef = useRef(null as any);

  const state = useLocalStore(() => ({
    visible: false,

    addAccount(name, cctxOptions) {
      accounts.createAccountAndSaveLs(exchange, name, cctxOptions).then(() => {
        console.log("添加成功");
        state.visible = false;
      });
    },

    handleCreate() {
      const form = formRef.current.props.form as WrappedFormUtils;
      form.validateFields((err, values) => {
        if (err) {
          return;
        }
        console.log("Received values of form: ", values);

        state.addAccount(values.name, {
          apiKey: values.apiKey,
          secret: values.secret
        });
      });
    }
  }));

  useEffect(() => {
  }, []);

  const list = accounts.all.filter(o => o.exchange === exchange);

  return (
    <UpdatableCard
      title={<div>Accounts in:{exchange.exchange}</div>}
      updatableRes={accounts}
    >

      <div style={{padding: 12}}>
        <Button
          type={"primary"}
          onClick={() => {
            state.visible = true;
          }}
        >
          add
        </Button>
      </div>


      <AccountCreateForm
        wrappedComponentRef={formRef as any}
        visible={state.visible as any}
        onCancel={() => {
          state.visible = false;
        }}
        onCreate={() => {
          state.handleCreate();
        }}
      />

      <Table
        size={"small"}
        dataSource={list}
        rowKey={row => {
          return row.name;
        }}
        columns={[
          mCol({
            dataIndex: "name",
            templateRender(row: Account) {
              return (
                <Tag
                  color="gold"
                  onClick={() => {
                    uiStates.account = row;
                  }}
                >
                  {row.name}
                </Tag>
              );
            }
          }),
          mCol({
            dataIndex: "action",
            templateRender: (row: Account, v) => (
              <div>
                <Button
                  type={"danger"}
                  size={"small"}
                  onClick={() => {
                    accounts.lsAccountsRemove(row.name);
                  }}
                >
                  delete
                </Button>
              </div>
            )
          })
        ]}
      />

      {uiStates.account && (
        <UserAsset key={uiStates.account.name} account={uiStates.account}/>
      )}
    </UpdatableCard>
  );
});

const AccountCreateForm = Form.create<{
  visible;
  onCancel;
  onCreate;
  form;
  wrappedComponentRef;
}>({name: "AccountCreateForm"})(
  class extends React.Component {
    render() {
      const {visible, onCancel, onCreate, form} = this.props as any;
      const {getFieldDecorator} = form;
      return <HookForm {...this.props} />;
    }
  }
);

function HookForm(props: any) {
  const {visible, onCancel, onCreate, form} = props;
  const {getFieldDecorator} = form;
  return (
    <Modal
      visible={visible}
      title="Create An Account"
      okText="Create"
      onCancel={onCancel}
      onOk={onCreate}
    >
      <Form layout="vertical">
        <Form.Item label="name">
          {getFieldDecorator("name", {
            rules: [
              {
                required: true
              }
            ]
          })(<Input/>)}
        </Form.Item>
        <Form.Item label="apiKey">
          {getFieldDecorator("apiKey", {
            rules: [
              {
                required: true
              }
            ]
          })(<Input/>)}
        </Form.Item>
        <Form.Item label="secret">
          {getFieldDecorator("secret", {
            rules: [
              {
                required: true
              }
            ]
          })(<Input/>)}
        </Form.Item>
      </Form>
    </Modal>
  );
}

const UserAsset = observer(function UserAsset(props: { account: Account }) {
  const {account} = props;

  const {uiStates} = useStore();

  const list = account.balances.balancesNotZero;

  return (
    <div className={"UserAsset"}>
      <UpdatableCard
        title={<div>Balances</div>}
        updatableRes={account.balances}
      >
        <Table
          size={"small"}
          dataSource={list}
          rowKey={"key"}
          columns={[
            mCol({
              dataIndex: "key",
              templateRender: (row: IBalanceRes) => {
                const coinSymbol = row.key;
                const markets = account.exchange.getMarketsByCoinSymbol(
                  coinSymbol
                );
                const loading = markets.every(o => o.loading);

                return (
                  <div>
                    {row.key} {/*{markets.length && (*/}
                    {/*  <Button*/}
                    {/*    type={"primary"}*/}
                    {/*    shape="circle"*/}
                    {/*    icon="sync"*/}
                    {/*    onClick={async () => {*/}
                    {/*      for (const market of markets) {*/}
                    {/*        await market.updateRes();*/}
                    {/*      }*/}
                    {/*    }}*/}
                    {/*    loading={loading}*/}
                    {/*  />*/}
                    {/*)}*/}
                  </div>
                );
              }
            }),
            mCol({dataIndex: "total"}),
            // mCol({ dataIndex: "free" }),
            // mCol({ dataIndex: "used" })
          ]}
          // expandedRowRender={row => {
          //   return (
          //     <Ob
          //       r={() => {
          //         const coinSymbol = row.key;
          //         const markets = account.exchange.getMarketsByCoinSymbol(
          //           coinSymbol
          //         );
          //
          //         return (
          //           <div className={"orderCol"}>
          //             {markets.map(o => {
          //               // account.exchange.marketsMap.get(o.spec.symbol);
          //               const { profit, rate } = account.computeProfitAndRate(
          //                 o
          //               );
          //
          //               const accountOrder = account.safeGetAccountOrder(o);
          //               const orderCount = accountOrder.all.length;
          //
          //               return (
          //                 <div key={o.spec.quote} className={"orderColItem"}>
          //                   <div className="btn">
          //                     <Button
          //                       type={"primary"}
          //                       shape="circle"
          //                       icon="sync"
          //                       onClick={async () => {
          //                         await accountOrder.updateRes();
          //                         await o.updateRes();
          //                       }}
          //                       loading={o.loading && accountOrder.loading}
          //                     />
          //                   </div>
          //                   <div className="quote">{o.spec.quote}:</div>
          //                   <div className="viewOrder">
          //                     <Badge count={orderCount}>
          //                       <Button
          //                         style={{ marginLeft: 8 }}
          //                         onClick={() => {
          //                           uiStates.market = o;
          //                         }}
          //                       >
          //                         切换市场
          //                       </Button>
          //                     </Badge>
          //                   </div>
          //                   <div className="profit">
          //                     <FormatValue val={profit} market={o.spec} /> (
          //                     <FormatPercentage val={rate} />)
          //                   </div>
          //                 </div>
          //               );
          //             })}
          //           </div>
          //         );
          //       }}
          //     />
          //   );
          // }}
        />
      </UpdatableCard>
    </div>
  );
});
