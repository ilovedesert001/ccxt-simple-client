import {AppSubStore} from "./AppSubStore";
import {AppRootStore} from "./AppRootStore";
import {observable} from "mobx";
import * as BrowserStore from "store";

export class Config extends AppSubStore<AppRootStore> {
  @observable version = 1;

  ls: LocalStorageType;

  constructor(root, parent) {
    super(root, parent);
    this.ls = BrowserStore;
  }

  // Used to merge display total assets
  baseCurrencies = new Map([
    [
      "USDT",
      {
        name: "USDT",
        precision: 2,
        minValue: 0.1
      }
    ],
    [
      "BTC",
      {
        name: "BTC",
        precision: 6,
        minValue: 0.001 // Assets less than 0.001 BTC will be hidden
      }
    ]
  ]);
}

export type LocalStorageType = {
  get: (key: string, defaultVal?: any) => any;
  set: (key: string, val: any) => void;
  remove: (key: string) => void;
};
