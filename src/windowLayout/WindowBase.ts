export type PositionType = {
  x: number;
  y: number;
};

export type SizeType = {
  w: number;
  h: number;
};

export type TransformType = PositionType & SizeType;

export enum WindowItemType {
  container = "container",
  tabs = "tabs", //tab container
  window = "window" //single window
}

export type WindowItemChildrenType = Array<IWindowItem>;

export interface IWindowItem {
  key: string;
  type: WindowItemType;

  reactBody?: {
    header: any;
    body: any;
  };

  options: {
    transform: TransformType;
    lock?: boolean;
    collapse?: boolean;
  };

  state?: {
    localPosition: PositionType;
    worldPosition: PositionType;
  };

  children?: WindowItemChildrenType;
}
