import { z } from "zod";

const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
  })
});
const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
  })
});


export const brandValidation = {
  createBrandSchema,
  updateBrandSchema,
};
