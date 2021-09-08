import { Query, Resolver, Arg } from "type-graphql";

import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return await Post.find();
  }

  @Query(() => Post)
  async post(@Arg("id") id: string): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      return null;
    }

    return post;
  }
}
