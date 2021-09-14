import {
  Arg,
  Field,
  Mutation,
  Resolver,
  ObjectType,
  InputType,
  Query,
  Ctx,
} from "type-graphql";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";

import { MyContext } from "../types";
import { User } from "../entities/User";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "./../constants";
import { RegisterInput } from "./RegisterInput";
import { validateRegister } from "./../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@InputType()
class LoginInput {
  @Field()
  usernameOrEmail: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne({ id: Number(req.session.userId) });

    if (!user) {
      return null;
    }

    return user;
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { req, redis }: MyContext
  ) {
    const user = await User.findOne({ email });

    if (!user) {
      return true;
    }

    const token = uuidv4();

    redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );

    const html = `<a href="http://localhost:3000/change-password/${token}">reset password</a>`;
    await sendEmail(email, html);

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 5) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password must be greater than 5 characters",
          },
        ],
      };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired",
          },
        ],
      };
    }

    const user = await User.findOne({ id: Number(userId) });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists",
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword);
    await user.save();

    await redis.del(key);

    req.session.userId = userId;

    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: RegisterInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);

    try {
      const user = await User.create({
        username: options.username,
        email: options.email,
        password: hashedPassword,
      }).save();

      req.session.userId = user.id;

      return { user };
    } catch (error) {
      if (error.code === "23505" && error.detail.includes("username")) {
        return {
          errors: [{ field: "username", message: "Username already taken" }],
        };
      }

      if (error.code === "23505" && error.detail.includes("email")) {
        return { errors: [{ field: "email", message: "Email already taken" }] };
      }
    }

    return {
      errors: [{ field: "server", message: "Something went wrong" }],
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: LoginInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      options.usernameOrEmail.includes("@")
        ? { email: options.usernameOrEmail }
        : { username: options.usernameOrEmail }
    );

    if (!user) {
      return {
        errors: [{ field: "usernameOrEmail", message: "User doesn't exist" }],
      };
    }

    const isValid = await argon2.verify(user.password, options.password);

    if (!isValid) {
      return {
        errors: [{ field: "password", message: "Incorrect password" }],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
