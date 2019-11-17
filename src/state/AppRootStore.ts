import {SubStore} from "./core";
import {Config} from "./Config";
import {Exchanges} from "./res/Exchanges";
import {UiStates} from "./UiStates";
import {Accounts} from "./res/Accounts";

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
