import {AppSubStore} from "../AppSubStore";
import {observable} from "mobx";

export class BaseResModel<ParentType = any> extends AppSubStore<ParentType> {
  @observable loading = false;
  @observable lastUpdateTime = new Date();


  loadingStart() {
    this.loading = true;
  }

  loadingEnd() {
    this.loading = false;
    this.lastUpdateTime = new Date();
  }

  updateRes() {
    console.warn("need to be implemented");
  }

}