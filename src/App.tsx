import React, { useEffect, useState } from "react";
import "./styles/App.scss";
import { AppRootStore } from "./state/AppRootStore";
import { StoreContext } from "./state";

import RouterApp from "./pages/index";

const store = (window["store"] = window["ss"] = new AppRootStore());

const App: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await store.exchanges.initExchanges();
      setReady(true);
    };

    init();
  }, []);
  return (
    <div className="App">
      <StoreContext.Provider value={store}>
        {ready && <RouterApp />}
      </StoreContext.Provider>
    </div>
  );
};

export default App;
