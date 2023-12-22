export type Leaf = string;

export type Branch = {
  [branch: string]: Leaf | NestedRecord;
};

export type NestedRecord = Leaf | Branch;
