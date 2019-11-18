import { SubStore } from "./core";
import { Config } from "./Config";
import { Exchanges } from "./res/Exchanges";
import { UiStates } from "./UiStates";
import { Accounts } from "./res/Accounts";

import { init as bigone3 } from "../cctxPatch/bigone3";
import { init as basefex } from "../cctxPatch/basefex";


bigone3();
basefex();

export class AppRootStore extends SubStore<null, AppRootStore> {
  name = "root store";

  config: Config;
  exchanges: Exchanges;
  accounts: Accounts;
  uiStates: UiStates;

  constructor() {
    super(null, null);

    this.config = new Config(this, this);
    this.exchanges = new Exchanges(this, this);
    this.accounts = new Accounts(this, this);
    this.uiStates = new UiStates(this, this);
  }
}
