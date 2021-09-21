import { Updoot } from "./../entities/Updoot";
import {
  Query,
  Resolver,
  Arg,
  Mutation,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  ObjectType,
  Root,
  Field,
} from "type-graphql";

import { MyContext } from "../types";
import { Post } from "../entities/Post";
import { isAuth } from "./../middleware/isAuth";
import { getConnection } from "typeorm";

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;
    Updoot.insert({
      userId: Number(userId),
      postId,
      value: realValue,
    });

    await getConnection().query(
      `
    START TRANSACTION;

    insert into updoot
    values (${userId},${postId},${realValue});

    update post 
    set points = points + ${realValue}
    where id = ${postId};
    
    COMMIT;
    `
    );

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = Math.min(50, limit) + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }
    const posts = await getConnection().query(
      `
    select p.*,
    u.username
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${cursor ? `where p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect(
    //     "p.creator",
    //     "u",
    //     'u.id = p."creatorId"'
    //   )
    //   .orderBy('p."createdAt"', "DESC")
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    // }
    // const posts = await qb.getMany();
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  createPost(
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      title,
      text,
      creatorId: Number(req.session.userId),
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
