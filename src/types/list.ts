export type List = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    lastActiveAt: Date | null;
    activated: boolean;
    displayName: string;
    description: string;
  };
  name: string;
  description: string;
  pathName: string;
  schema: any;
  pinned: boolean;
  readonly: boolean;
  realtime: boolean;
  protected: boolean;
  indexable: boolean;
  activated: boolean;
  itemCount: number;
};
