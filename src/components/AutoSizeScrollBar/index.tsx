import { observer, useLocalStore } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import _ from "lodash";
import Scrollbars from "react-custom-scrollbars";
import ResizeObserver from "@juggle/resize-observer";

export const AutoSizeScrollBar = observer(function AutoSizeScrollBar(props: {
  children: any;
  minWidth?: number;
}) {
  const el = useRef(null as HTMLDivElement);

  const { minWidth = 10 } = props;

  const state = useLocalStore(() => ({
    width: 10,
    height: 10,

    setWH: _.debounce((w, h) => {
      if (w) {
        state.width = w;
      }
      if (h) {
        state.height = h;
      }

      state.parentResizing = false;
    }, 300),

    parentResizing: false
  }));

  useEffect(() => {
    const parentElement = el.current.parentElement.parentElement.parentElement;

    const ro = new ResizeObserver(entries => {
      const e1 = entries[0];

      const width = e1.contentRect.width;
      const height = e1.contentRect.height;
      state.parentResizing = true;
      state.setWH(width, height);
    });

    ro.observe(parentElement);

    return () => {
      ro.disconnect();
    };
  }, []);

  const width = state.width > minWidth ? state.width : minWidth;

  return (
    <Scrollbars
      style={{ maxHeight: state.height, width }}
      className={"AutoSizeScrollBar"}
      renderThumbVertical={() => <div className={"ThumbStyle"} />}
      renderThumbHorizontal={() => <div className={"ThumbStyle"} />}
    >
      <div
        ref={el}
        style={{
          width: "100%",
          height: "100%",
          display: state.parentResizing ? "none" : "block"
        }}
      >
        {props.children}
      </div>
    </Scrollbars>
  );
});
