import { RegisterInput } from "../resolvers/RegisterInput";

export const validateRegister = (options: RegisterInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Please enter a valid email",
      },
    ];
  }
  if (options.username.length <= 5) {
    return [
      {
        field: "username",
        message: "Username must be greater than 5 characters",
      },
    ];
  }
  if (options.password.length <= 5) {
    return [
      {
        field: "password",
        message: "Password must be greater than 5 characters",
      },
    ];
  }

  return null;
};
