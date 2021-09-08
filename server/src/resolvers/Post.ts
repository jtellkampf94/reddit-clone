import { Query, Resolver, Arg, Int, Mutation } from "type-graphql";

import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return await Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  createPost(
    @Arg("title") title: string,
    @Arg("text") text: string
  ): Promise<Post> {
    return Post.create({
      title,
      text,
    }).save();
  }

  @Mutation(() => Post || null)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", { nullable: true }) title: string,
    @Arg("text", { nullable: true }) text: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ id });

    if (!post) {
      return null;
    }

    if (title !== undefined) {
      post.title = title;
    }

    if (text !== undefined) {
      post.text = text;
    }

    return post.save();
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    const post = await Post.findOne({ id });

    if (!post) {
      return false;
    }

    post.remove();

    return true;
  }
}
