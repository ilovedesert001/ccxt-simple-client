import React, {useContext} from "react";
import {AppRootStore} from "./AppRootStore";

import * as mobx from "mobx";

export const StoreContext = React.createContext(null as AppRootStore | null);

export function useStore(): AppRootStore {
  return useContext(StoreContext);
}

window["mobx"] = mobx;
