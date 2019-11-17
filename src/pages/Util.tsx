import {Layout, Menu} from "antd";
import React from "react";
import {useHistory} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {useStore} from "../state";

const {Header, Footer, Content} = Layout;

export const PageStruct = function (props: { children: any }) {
  return (
    <Layout>
      <AppHeader/>
      <Content style={{minHeight: "90vh"}}>{props.children}</Content>
      <Footer>Footer</Footer>
    </Layout>
  );
};

const AppHeader = observer(function () {
  const {uiStates} = useStore();
  const history = useHistory();

  return (
    <Header className={"appHeader"}>
      <Menu
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={["exchanges"]}
        style={{lineHeight: "64px"}}
      >
        <Menu.Item
          key="exchanges"
          onClick={() => {
            history.push("/");
          }}
        >
          Exchanges
        </Menu.Item>
        <Menu.Item
          key="exchange"
          onClick={() => {
            const exchangeKey = uiStates.exchange ? uiStates.exchange.exchange : '';
            history.push(`/exchange/${exchangeKey}`);
          }}
        >
          Exchange
        </Menu.Item>
        {/*<Menu.Item key="3">Setting</Menu.Item>*/}
      </Menu>
    </Header>
  );
});
