import z from "zod";
const registerUser = z.object({
  body: z.object({
    phone: z.string({
      required_error: "Phone is required!",
    }),
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({
        message: "Invalid email format!",
      }),
    password: z.string({
      required_error: "Password is required!",
    }),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    age: z
      .number()
      .int({
        message: "Age must be an integer!",
      })
      .optional(),
    bio: z
      .string({
        required_error: "Bio is required!",
      })
      .optional(),
    lastDonationDate: z
      .string({
        required_error: "Last donation date is required!",
      })
      .optional(),
  }),
});


const forgotPassword = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({
        message: "Invalid email format!",
      }),
  }),
});

const verifyOtp = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({
        message: "Invalid email format!",
      }),
    otp: z.number({
      required_error: "OTP is required!",
    }),
  }),
});

export const UserValidations = {
  registerUser,
  updateProfileSchema,
  forgotPassword,
  verifyOtp,
};
