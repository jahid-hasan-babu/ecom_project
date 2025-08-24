import { z } from "zod";


const variantAttributeSchema = z.object({
  key: z.string().min(1, "Attribute key is required"),
  value: z.string().min(1, "Attribute value is required"),
});


const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be >= 0"),
  stock: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  attributes: z.array(variantAttributeSchema).optional(),
});



const createProductSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Product name is required"),
      description: z.string().optional(),
      brandId: z.string().min(1, "BrandId is required"),
      categoryId: z.string().min(1, "CategoryId is required"),
      variants: z.array(variantSchema).min(1, "At least one variant is required"),
      promoId: z.string().optional(),
    })
});

export const productValidation = {
    createProductSchema
}

