export interface IVariantAttribute {
  key: string;
  value: string;
}


export interface IVariantImage {
  url: string;
  isPrimary?: boolean;
}


export interface IVariant {
  sku: string;
  price: number;
  stock?: number;
  isActive?: boolean;
  attributes?: IVariantAttribute[];
  images?: IVariantImage[];
}


export interface IProductImage {
  url: string;
  isPrimary?: boolean;
}


export interface ICreateProduct {
  name: string;
  description?: string;
  brandId?: string;
  categoryId?: string;
  images?: IProductImage[];
  variants?: IVariant[];
}
