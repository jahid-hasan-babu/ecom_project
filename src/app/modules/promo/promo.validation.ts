import { z } from "zod";

const createPromoSchema = z.object({
  body: z.object({
    code: z
      .string({
        required_error: "Promo code is required",
      })
      .min(3, "Promo code must be at least 3 characters long"),
    type: z.enum(["PERCENT", "FIXED"], {
      required_error: "Promo type is required",
    }),
    value: z
      .number({
        required_error: "Promo value is required",
      })
      .positive("Value must be greater than 0"),
    validFrom: z.coerce.date({
      required_error: "Valid from date is required",
    }),
    validTo: z.coerce.date({
      required_error: "Valid to date is required",
    }),
    maxUsage: z
      .number()
      .int("Max usage must be an integer")
      .positive("Max usage must be greater than 0")
      .optional(),
  }),
});


export const promoValidation = {
  createPromoSchema
};
