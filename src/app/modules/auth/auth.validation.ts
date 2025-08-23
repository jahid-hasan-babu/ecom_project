import { UserRole } from "@prisma/client";
import z from "zod";

const registerUser = z.object({
  body: z.object({
    username: z.string({
      required_error: "User Name is required!",
    }),
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({
        message: "Invalid email format!",
      }),
    password: z
      .string({
        required_error: "Password is required!",
      })
      .min(8, "password should be minimum 8 characters "),
  }),
});

const loginUser = z.object({
  body: z.object({
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
    userId: z.string({
      required_error: "userId is required!",
    }),
    otpCode: z.number({
      required_error: "otpCode is required!",
    }),
  }),
});

const resetPassword = z.object({
  body: z.object({
    newPassword: z
      .string({
        required_error: "Password is required!",
      })
      .min(8, "password should be minimum 8 characters "),
  }),
});
const changePassword = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: "old Password is required!",
    }),
    newPassword: z
      .string({
        required_error: "new password is required!",
      })
      .min(8, "Password should be minimum 8 characters "),
  }),
});

//partner

export const partnerRegistration = z.object({
  body: z.object({
    dateTimeFormat: z.string().nonempty("Data/time format is required"),
    timezone: z.string().nonempty("Timezone is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    companyName: z.string().min(1, "Company name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required")
      .max(255, "Email is too long")
      .trim(),
    phoneNumber: z
      .string()
      .regex(
        /^\+?\d{1,4}[\s-]?\(?\d{1,4}?\)?[\s-]?\d{1,4}[\s-]?\d{1,4}$/,
        "Invalid phone number format"
      )
      .min(10, "Mobile phone is required")
      .max(20, "Mobile phone number is too long"),
    password: z.string().min(8, "Password should have at least 8 characters"),
  }),
});

export const authValidation = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,

  partnerRegistration,
};
