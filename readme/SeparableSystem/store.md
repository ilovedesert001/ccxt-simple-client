# Shared tree mobx store



## Origin

Split a large class into many small classes .to form a tree structure .  Share all states between all nodes through the parent node or the root node



## Features

-[x] can get all states from anywhere in the tree
-[x] generate pure objects for ssr



## Idea

before

```typescript

class LargeStore {
  //item type1
  @observable itemType1Price = 0;
  @observable itemType1Amount = 1;
  @computed get itemType1Total() {
    return this.itemType1Price * this.itemType1Amount;
  }

  //item type2
  @observable itemType2Size = 0;
  @action updateItemType2AndTyp1Price() {
    this.itemType2Size += 1;
    this.itemType1Price += 1;
  }
}
   
```

after

```typescript

class AppStore {
  item1: ItemType1;
  item2: ItemType2;
}

class ItemType1 {
  @observable price = 0;
  @observable amount = 1;
  @computed get total() {
    return this.price * this.amount;
  }
}

class ItemType2 {
  @observable size = 0;
  @action updateItemType2AndTyp1Price() {
    this.size += 1;
    const item1 = this.parent.item1;
    item1.price += 1;
  }
}

```
