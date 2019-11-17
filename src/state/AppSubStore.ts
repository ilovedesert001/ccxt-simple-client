import {SubStore} from "./core";
import {AppRootStore} from "./AppRootStore";

export class AppSubStore<ParentType> extends SubStore<ParentType,
  AppRootStore> {
}
