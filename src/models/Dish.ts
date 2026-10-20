
export type DishImage = {
    BIT240092_ImageUrl: string;
    BIT240092_IsThumbnail: boolean;
};

export type Dish = {
    BIT240092_Id: string;
    BIT240092_Name: string;
    BIT240092_Price: number;
    BIT240092_PreparationTime: number;
    BIT240092_IsAvailable: boolean;
    BIT240092_Description: string;
    BIT240092_DishCategoryId: string;
    BIT240092_DishImage: DishImage[];
};
