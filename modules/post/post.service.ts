import { Api } from "telegram";
import { client, redis } from "../../app.js";
import config from "../../config/config.js";
import type { ChannelLanguage } from "./dto/fetch-posts.dto.js";
import HttpError from "../../utils/exceptions/HttpError.js";

class PostService {
  async fetchPosts(language: ChannelLanguage) {
    await client.connect();

    const channel = await client.getInputEntity(`@neroteam_${language}`);
    const messages: any = await client.invoke(
      new Api.messages.GetHistory({
        peer: channel,
        limit: 9,
      }),
    );

    const result = await Promise.all(
      messages.messages.map(
        async (
          message: {
            id: number;
            message: string;
            date: number;
            media: any;
          },
          index: number,
        ) => {
          const baseMessage = {
            id: index + 1,
            message: message.message,
            date: new Date(message.date * 1000),
            media: {} as {
              photo: { url: string; width: number; height: number };
            },
          };

          if (message.media?.photo) {
            try {
              const buffer = await client.downloadMedia(message.media.photo);
              const imageId = `tg-photo-${message.id}-${Date.now()}`;

              await this.cacheImage(imageId, buffer as Buffer);

              baseMessage.media.photo = {
                url: `/api/image/${imageId}`,
                width:
                  message.media.photo.sizes?.[0]?.w || config.defaultPhotoWidth,
                height:
                  message.media.photo.sizes?.[0]?.h ||
                  config.defaultPhotoHeight,
              };
            } catch (err) {
              console.error("Failed to download photo:", err);
            }
          }
        },
      ),
    );

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
