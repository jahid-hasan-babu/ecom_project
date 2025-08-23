import z from "zod";

const categorySchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required!",
    }),
  })
    
});



export const CategoryValidations = {
  categorySchema,
};
