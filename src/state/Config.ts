import { AppSubStore } from "./AppSubStore";
import { AppRootStore } from "./AppRootStore";
import { observable } from "mobx";
import * as BrowserStore from "store";

export class Config extends AppSubStore<AppRootStore> {
  @observable version = 1;

  ls: LocalStorageType;

  constructor(root, parent) {
    super(root, parent);
    this.ls = BrowserStore;
  }
}

export type LocalStorageType = {
  get: (key: string, defaultVal?: any) => any;
  set: (key: string, val: any) => void;
  remove: (key: string) => void;
};
