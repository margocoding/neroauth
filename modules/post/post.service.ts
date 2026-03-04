import { Api } from "telegram";
import { client, redis } from "../../app.js";
import config from "../../config/config.js";
import type { ChannelLanguage, message } from "./dto/fetch-posts.dto.js";
import HttpError from "../../utils/exceptions/HttpError.js";

class PostService {
  async fetchPosts(language: ChannelLanguage) {
    const cachedPosts = await redis.get(`posts_${language}`);

    if (cachedPosts) return JSON.parse(cachedPosts);

    if (!client.connected) {
      await client.connect();
    }

    const channel = await client.getInputEntity(`@neroteam_${language}`);
    const messages: any = await client.invoke(
      new Api.messages.GetHistory({
        peer: channel,
        limit: config.maxTgRequestPostCount,
      }),
    );

    messages.messages = messages.messages.filter((message: message) => {
      return message.message;
    }); // фильтруем чтоб посты имели текст, т.к. это могут быть и сервисные "посты" по типу канал закрепил пост
    messages.messages = messages.messages.slice(0, config.maxPostsViewCount);

    const result = await Promise.all(
      messages.messages.map(
        async (
          message: message,
          index: number,
        ) => {
          const baseMessage = {
            id: message.id,
            message: message.message,
            date: new Date(message.date * 1000),
          };

          return baseMessage;
        },
      ),
    );

    await redis.set(`posts_${language}`, JSON.stringify(result), 'EX', config.posts_cache_lifetime);

    return result;
  }

  private async cacheImage(id: string, buffer: Buffer) {
    await redis.set(
      `image:${id}`,
      buffer.toString("base64"),
      "EX",
      config.image_ttl,
    );
  }

  async fetchCachedImage(id: string) {
    const cached = await redis.get(`image:${id}`);

    if (!cached) {
      throw HttpError.NotFound("Image not found");
    }

    const buffer = Buffer.from(cached, "base64");

    return buffer;
  }
}

export default new PostService();
