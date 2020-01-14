import { IWindowItem, WindowItemType } from "./WindowBase";

export const a = 1;

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

export const testLayout = layout;
