import { observable, toJS } from "mobx";
import { observer, useLocalStore } from "mobx-react-lite";
import React, { useRef } from "react";
import { Rnd } from "react-rnd";



export const SimpleGridLayout = observer(function(props: {
  layout?: Layout;
  keyToComponents?: {};
}) {
  const {
    layout = [
      {
        type: LayoutItemType.window,
        key: "window1",
        compKey: "comp1"
      },
      {
        type: LayoutItemType.window,
        key: "window2",
        compKey: "comp2"
      },
      {
        type: LayoutItemType.container,
        key: "container1",
        children: [
          {
            type: LayoutItemType.window,
            key: "container1_window1",
            compKey: "comp1"
          },
          {
            type: LayoutItemType.window,
            key: "container1_window2",
            compKey: "comp3"
          }
        ]
      },
      {
        type: "tabs",
        key: "tab1",
        children: [
          {
            type: LayoutItemType.window,
            key: "window1",
            compKey: "comp1"
          },
          {
            type: LayoutItemType.window,
            key: "window2",
            compKey: "comp2"
          }
        ]
      }
    ] as Layout,

    keyToComponents = {
      comp1: <div>custom component1</div>,
      comp2: <div>custom component2</div>
    }
  } = props;

  //define manager
  const rndManagerRef = useRef({
    maxZIndex: "999",
    prevDraggedNode: null as HTMLElement,
    prevDraggedNodeZIndex: null as string
  });





  const state = useLocalStore(
    props => ({
      renderComponentByCompKey(key: string) {
        let comp = keyToComponents[key]; //TODO wrong way
        if (!comp) {
          comp = (
            <div>
              <h2>Undefined component</h2>
            </div>
          );
        }
        return comp;
      },

      renderLayout(layout: Layout) {
        return layout.map(item => {
          if (item.type === LayoutItemType.window) {
            return (
              <Rnd
                key={item.key}
                className={'RndItem'}
                bounds="parent"
                default={{
                  width: 200,
                  height: 200,
                  x: 800 * Math.random(),
                  y: 300 * Math.random()
                }}
                resizeGrid={[24, 24]}
                dragGrid={[24, 24]}
                dragHandleClassName={"header"}
                onDragStart={(e, node) => {
                  console.log("AAA",node)
                  e.stopPropagation();
                  const manager = rndManagerRef.current;
                  if (manager.prevDraggedNode) {
                    manager.prevDraggedNode.style.zIndex =
                      manager.prevDraggedNodeZIndex;
                  }
                  manager.prevDraggedNode = node.node;
                  manager.prevDraggedNodeZIndex =
                    manager.prevDraggedNode.style.zIndex;
                  manager.prevDraggedNode.style.zIndex = manager.maxZIndex;
                }}
              >
                <Grid key={item.key} title={item.key}>
                  {state.renderComponentByCompKey(item.compKey)}
                </Grid>
              </Rnd>
            );
          } else if (item.type === LayoutItemType.container) {
            return (

              <Rnd
                key={item.key}
                className={'RndItem'}
                bounds="parent"
                default={{
                  width: 200,
                  height: 200,
                  x: 800 * Math.random(),
                  y: 300 * Math.random()
                }}
                resizeGrid={[24, 24]}
                dragGrid={[24, 24]}
                dragHandleClassName={"header"}
                onDragStart={(e, node) => {
                  const manager = rndManagerRef.current;
                  if (manager.prevDraggedNode) {
                    manager.prevDraggedNode.style.zIndex =
                      manager.prevDraggedNodeZIndex;
                  }
                  manager.prevDraggedNode = node.node;
                  manager.prevDraggedNodeZIndex =
                    manager.prevDraggedNode.style.zIndex;
                  manager.prevDraggedNode.style.zIndex = manager.maxZIndex;
                }}
              >
                <Grid key={item.key} title={item.key}>
                  {state.renderLayout(item.children)}
                </Grid>
              </Rnd>
            );
          }
          // else if (item.type === LayoutItemType.tabs) {
          //   return (
          //     <Grid key={item.key} title={item.key}>
          //       {state.renderLayout(item.children)}
          //     </Grid>
          //   );
          // }
        });
      }
    }),
    props
  );

  // const layout = toJS(state.layout);

  return (
    <div className={"SimpleGridLayout"}>
      SimpleGridLayout

      <div className="SimpleGridLayoutContainer">
        {state.renderLayout(layout)}
      </div>
    </div>
  );
});

export const Grid = observer(function Window(props: {
  title?: any;
  children?: any;
}) {
  const { title = "title", children = "nothing" } = props;

  return (
    <div className="Grid">
      <div className="header">
        <div className="left">{title}</div>
        <div className="right">X</div>
      </div>
      <div className="container">{children}</div>
    </div>
  );
});

export enum LayoutItemType {
  window = "window", //single window
  container = "container",
  tabs = "tabs" //tab container
}

export interface LayoutItem {
  type: LayoutItemType;
  key: string;
  compKey: string;
  //position info , relative to parent
  children: LayoutItem[];
}

export type Layout = LayoutItem[];
