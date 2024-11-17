export type Item = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  data: any;
  description: string;
  version: string;
  readonly: boolean;
  activated: boolean;
  size: number;
};
