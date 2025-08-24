import { z } from "zod";


export const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const phoneSchema = z
  .string()
  .min(6)
  .max(20)
  .regex(/^\+?\d{6,20}$/, "Invalid phone number")
  .optional();

export const createOrderSchema = z.object({
   body: z
    .object({
       cartId: objectId,
        name: z.string().min(1, "Name is required").max(100).optional(),
        phone: phoneSchema,
        address: z.string().min(1, "Address is required").max(300).optional(),
        usePromo: z.boolean().optional().default(false),
    })
});





export const checkoutValidation = {
  createOrderSchema
};
