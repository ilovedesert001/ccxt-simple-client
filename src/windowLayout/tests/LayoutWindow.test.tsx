import { LayoutWindowManager } from "../LayoutWindowManager";
import { IWindowItem, WindowItemType } from "../WindowBase";

describe("LayoutWindow", () => {
  function getNewManager() {
    const manager = new LayoutWindowManager();

    const layout: IWindowItem = {
      key: "root",
      type: WindowItemType.container,
      options: {
        transform: {
          x: 0,
          y: 0,
          w: 1000,
          h: 800
        }
      },
      children: [
        {
          key: "root_w1",
          type: WindowItemType.window,
          options: {
            transform: {
              x: 5,
              y: 5,
              w: 100,
              h: 120
            }
          }
        },
        {
          key: "root_container1",
          type: WindowItemType.container,
          options: {
            transform: {
              x: 180,
              y: 200,
              w: 680,
              h: 410
            }
          },
          children: [
            {
              key: "container1_w1",
              type: WindowItemType.window,
              options: {
                transform: {
                  x: 5,
                  y: 50,
                  w: 200,
                  h: 120
                }
              }
            },

            {
              key: "container2",
              type: WindowItemType.container,
              options: {
                transform: {
                  x: 150,
                  y: 200,
                  w: 430,
                  h: 170
                }
              },
              children: [
                {
                  key: "c2_w1",
                  type: WindowItemType.window,
                  options: {
                    transform: {
                      x: 20,
                      y: 55,
                      w: 130,
                      h: 85
                    }
                  }
                },
                {
                  key: "c2_w2",
                  type: WindowItemType.window,
                  options: {
                    transform: {
                      x: 230,
                      y: 55,
                      w: 140,
                      h: 85
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    manager.rebuildRootState(layout);
    return manager;
  }

  test("world position", () => {
    const manager = getNewManager();

    //root
    {
      const item = manager.root;
      expect(item.key).toBe("root");
      expect(item.state.localPosition).toEqual({
        x: 0,
        y: 0
      });
    }

    //container1_w1
    {
      const item = manager.itemByKey["container1_w1"];
      expect(item.key).toBe("container1_w1");
      expect(item.state.localPosition).toEqual({
        x: 5,
        y: 50
      });

      expect(item.state.worldPosition).toEqual({
        x: 185,
        y: 250
      });
    }

    //container2
    {
      const item = manager.itemByKey["container2"];
      expect(item.state.worldPosition).toEqual({
        x: 330,
        y: 400
      });
    }

    //c2_w1
    {
      const item = manager.itemByKey["c2_w1"];
      expect(item.state.worldPosition).toEqual({
        x: 350,
        y: 455
      });
    }

    //c2_w2
    {
      const item = manager.itemByKey["c2_w2"];
      expect(item.state.worldPosition).toEqual({
        x: 560,
        y: 455
      });
    }

    manager.getLayout();
  });

  test("removeItem", () => {
    const manager = getNewManager();
    const itemKey = "c2_w2";
    {
      const layout = manager.getLayout();
      const layoutAfterStr = JSON.stringify(layout);
      expect(layoutAfterStr.indexOf(itemKey) > 0).toBeTruthy();
    }

    manager.removeItem(manager.itemByKey[itemKey]);

    {
      const layout = manager.getLayout();
      const layoutAfterStr = JSON.stringify(layout);
      expect(layoutAfterStr.indexOf(itemKey) > 0).toBeFalsy();
    }
  });

  test("handleDrop", () => {
    const manager = getNewManager();

    const from = manager.itemByKey["c2_w2"];
    const to = manager.itemByKey["root_container1"];

    manager.handleDrop(from, to);

    const layout = manager.getLayout();

    expect(layout.children[1].children[2].key).toBe("c2_w2");

    expect(layout.children[1].children[1].children.length).toBe(1);
  });
});
