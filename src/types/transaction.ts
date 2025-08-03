export interface Transaction {
  _id?: string;
  item: string;
  cost: number;
  date: Date;
  is_grocery?: boolean;
  is_entertainment?: boolean;
  is_transportation?: boolean;
  is_food_drink?: boolean;
  is_shopping?: boolean;
  is_utilities?: boolean;
  is_healthcare?: boolean;
  is_education?: boolean;
  is_other?: boolean;
}