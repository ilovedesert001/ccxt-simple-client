import {observer} from "mobx-react-lite";
import React from "react";
import {PageStruct} from "../Util";
import {Exchanges} from "../../components/Exchanges";

export const Home = observer(function Home() {
  return (
    <PageStruct>
      <Exchanges />
    </PageStruct>
  );
});
