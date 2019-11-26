import { isObservableArray, isObservableMap, isObservableObject } from "mobx";

export abstract class SubStore<ParentType = any, RootStoreType = ParentType> {
  store: RootStoreType; //root
  parent: ParentType; // parent store

  constructor(root: RootStoreType | null, parent: ParentType) {
    this.store = root as RootStoreType;
    if (!root) {
      this.store = (this as unknown) as RootStoreType;
    }
    this.parent = parent;
  }

  private static getObjectSnapShoot(obj: Object) {
    for (const key of Object.keys(obj)) {
      if (obj.hasOwnProperty(key)) {
        let val = obj[key] as unknown;
        obj[key] = SubStore.getAnySnapShoot(val);
      }
    }
    return obj;
  }

  static getAnySnapShoot(obj: any) {
    if (obj instanceof SubStore) {
      return obj.getSnapShoot();
    } else if (obj instanceof Array) {
      return obj.map(item => SubStore.getAnySnapShoot(item));
    } else if (obj instanceof Map) {
      const itemObj = {};
      obj.forEach((item, itemKey) => {
        itemObj[itemKey] = SubStore.getAnySnapShoot(item);
      });
      return itemObj;
    } else if (isObservableArray(obj)) {
      return SubStore.getAnySnapShoot(Array.from(obj));
    } else if (isObservableMap(obj)) {
      const pureMap = new Map(obj);
      return SubStore.getAnySnapShoot(pureMap);
    } else if (isObservableObject(obj)) {
      const itemObj = {};
      for (const key of Object.keys(obj)) {
        if (obj.hasOwnProperty(key)) {
          itemObj[key] = obj[key];
        }
      }
      return SubStore.getObjectSnapShoot(itemObj);
    } else if (obj instanceof Object) {
      const itemObj = {};
      for (const key of Object.keys(obj)) {
        if (obj.hasOwnProperty(key)) {
          itemObj[key] = obj[key];
        }
      }
      return SubStore.getObjectSnapShoot(itemObj);
    } else {
      return obj;
    }
  }

  getSnapShoot(): this {
    const o = Object.assign({}, this);
    delete o.store;
    delete o.parent;
    return SubStore.getAnySnapShoot(o);
  }

  toJSON() {
    return this.getSnapShoot();
  }
}
