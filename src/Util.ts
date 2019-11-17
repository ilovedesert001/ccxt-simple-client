export function forTwo<T = any>(arr: T[], handle: (current: T, next: T) => void) {
  if (arr.length < 2) {
    return;
  }
  const len = arr.length - 1;
  for (let i = 0; i < len; i++) {
    const current = arr[i]
    const next = arr[i + 1];
    handle(current, next)
  }
}


//把 ls 的一个字段当做 map 来用
export class CommonSubLs {
  rootKey: string;
  ls: any;

  constructor(localStorageManager, rootKey: string) {
    this.rootKey = rootKey;
    this.ls = localStorageManager;
  }

  lsGet = (k: string, dv) => {
    const root = this.ls.get(this.rootKey, {});
    let item = root[k];
    if (item === undefined) {
      item = dv;
    }
    return item;
  };

  lsSet = (k, v) => {
    const root = this.ls.get(this.rootKey, {});
    root[k] = v;
    this.ls.set(this.rootKey, root);
  };

  lsRemove = k => {
    const root = this.ls.get(this.rootKey, {});
    delete root[k];
    this.ls.set(this.rootKey, root);
  };
}
