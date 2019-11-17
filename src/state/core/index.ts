import {isObservableArray, isObservableMap} from 'mobx';

export abstract class SubStore<ParentType = any, RootStoreType = ParentType> {
  store: RootStoreType; //root
  parent: ParentType; // parent store

  constructor(root: RootStoreType | null, parent: ParentType, snapShot?: any) {
    this.store = root as RootStoreType;
    if (!root) {
      this.store = (this as unknown) as RootStoreType;
    }
    this.parent = parent;
    this.applySnapShot(snapShot);
  }

  //store clone
  static getStoreSnapShoot(obj: SubStore) {
    delete obj.store;
    delete obj.parent;
    for (const key of Object.keys(obj)) {
      if (obj.hasOwnProperty(key)) {
        let val = obj[key] as unknown;

        if (val instanceof SubStore) {
          obj[key] = val.getSnapShoot();
        } else if (Array.isArray(val) || isObservableArray(val)) {
          val = val.map((item) => {
            if (item instanceof SubStore) {
              item = item.getSnapShoot();
            }
            return item;
          });
          obj[key] = val;
        } else if (val instanceof Map || isObservableMap(val)) {
          const itemObj = {};
          val.forEach((item, itemKey) => {
            itemObj[itemKey] = item;
            if (item instanceof SubStore) {
              itemObj[itemKey] = item.getSnapShoot();
            }
          });
          obj[key] = itemObj;
        } else if (typeof val === 'object') {
          obj[key] = SubStore.getStoreSnapShoot(val as any);
        }
      }
    }
    return obj;
  }

  getSnapShoot(self = this): this {
    let obj = Object.assign({}, self);
    // obj = toJS(obj);
    return SubStore.getStoreSnapShoot(obj) as any;
  }

  toJSON() {
    const obj = Object.assign({}, this);
    delete obj.store;
    delete obj.parent;

    return obj;
  }

  applySnapShot(snapShot: this) {
    // console.warn('need to be implemented');
  }
}
