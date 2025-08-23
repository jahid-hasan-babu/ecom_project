import z from "zod";

const updateProfileSchema = z.object({
  body: z
    .object({
      fullName: z.string().optional(),
      gender: z.enum(["Male", "Female", "Other"]).optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      profileImage: z.string().optional(),
    })
    .refine((data) => !("email" in data), {
      message: "You cannot update email!",
      path: ["email"],
    }),
});



export const UserValidations = {
  updateProfileSchema,
};
