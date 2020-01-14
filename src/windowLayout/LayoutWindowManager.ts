import { IWindowItem, WindowItemType } from "./WindowBase";
import _ from "lodash";

export class LayoutWindowManager {
  public root: IWindowItem;

  public itemByKey: { [key: string]: IWindowItem } = {};

  static eachItem(
    entry: IWindowItem,
    handler: (item: IWindowItem, parent: IWindowItem) => boolean,
    parent?: IWindowItem
  ) {
    const children = entry.children;
    if (handler(entry, parent)) {
      if (children) {
        for (const item of children) {
          if (item.type === WindowItemType.window) {
            const needContinue = handler(item, entry);
            if (!needContinue) {
              break;
            }
          } else if (item.type === WindowItemType.container) {
            LayoutWindowManager.eachItem(item, handler, entry);
          }
        }
      }
    }
  }

  private resetStatePositions(parent: IWindowItem, item: IWindowItem) {
    const transform = item.options.transform;
    item.state.localPosition = {
      x: transform.x,
      y: transform.y
    };

    //local pos to world (root)
    if (parent) {
      const parentWordPos = parent.state.worldPosition;
      item.state.worldPosition = {
        x: parentWordPos.x + transform.x,
        y: parentWordPos.y + transform.y
      };
    } else {
      item.state.worldPosition = {
        x: 0,
        y: 0
      };
    }
  }

  rebuildRootState(root: IWindowItem) {
    LayoutWindowManager.eachItem(root, (item, parent) => {
      this.itemByKey[item.key] = item;
      if (!item.state) {
        item.state = {
          localPosition: {
            x: 0,
            y: 0
          },
          worldPosition: {
            x: 0,
            y: 0
          }
        };
      }
      this.resetStatePositions(parent, item);
      return true;
    });

    this.root = root;
  }

  public getLayout() {
    const root = JSON.parse(JSON.stringify(this.root));
    LayoutWindowManager.eachItem(root, (item, parent) => {
      delete item.state;
      return true;
    });

    // console.log("root:");
    // console.log(JSON.stringify(root, null, 2));
    return root as IWindowItem;
  }

  private moveWindowNode(from: IWindowItem, to: IWindowItem) {}

  public removeItem(item: IWindowItem) {
    LayoutWindowManager.eachItem(this.root, (o, parent) => {
      if (o.key === item.key) {
        _.pull(parent.children, item);
        return false;
      } else {
        return true;
      }
    });
  }

  public handleDrop(from: IWindowItem, to: IWindowItem) {
    if (to.type === WindowItemType.container) {
      if (to.children.indexOf(from) >= 0) {
        console.warn("already exists !");
      } else {
        // 1. remove item from it's parent
        this.removeItem(from);

        //2. set position

        // 3. put item to target
        to.children.push(from);
      }
    }
  }

  // 也许不该在这里?
  public getDomNodesByItemPosition(item: IWindowItem) {
    let target = null as HTMLDivElement; // drop target element

    // console.log(JSON.stringify(item,null,2));

    // const targetPoint = {
    //   x: item.node.wordPos.x,
    //   y: item.node.wordPos.y
    // };
    //
    // const pos = {
    //   x: targetPoint.x + state.rootOffset.x - 2,
    //   y: targetPoint.y + state.rootOffset.y - 2
    // };
    //
    // // console.log(pos);
    // const els = document.elementsFromPoint(pos.x, pos.y);
    // console.log("el", els);
    // const el = els[1];
    // if (el) {
    //   console.log("xxx", el.getAttribute("data-dropable"));
    //   if (el.getAttribute("data-dropable") === "true") {
    //     target = el as HTMLDivElement;
    //   } else {
    //     target = parent_by_selector(el, "[data-dropable='true']");
    //   }
    //   console.log("target", target);
    //
    //   if (target) {
    //     state.handleItemDropByTargetDomNode(item, target, targetPoint);
    //   }
    // }

    return target;
  }
}
