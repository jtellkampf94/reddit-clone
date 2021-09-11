import {
  Arg,
  Field,
  InputType,
  Mutation,
  Resolver,
  ObjectType,
  Query,
  Ctx,
} from "type-graphql";
import argon2 from "argon2";

import { MyContext } from "../types";
import { User } from "../entities/User";

@InputType()
class UsernameAndPasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@InputType()
class RegisterInput extends UsernameAndPasswordInput {
  @Field()
  email: string;
}

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

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: RegisterInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 5) {
      return {
        errors: [
          {
            field: "username",
            message: "Username must be greater than 5 characters",
          },
        ],
      };
    }

    if (options.password.length <= 5) {
      return {
        errors: [
          {
            field: "password",
            message: "Password must be greater than 5 characters",
          },
        ],
      };
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
    @Arg("options") options: UsernameAndPasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ username: options.username });

    if (!user) {
      return {
        errors: [{ field: "username", message: "Username doesn't exist" }],
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
}
