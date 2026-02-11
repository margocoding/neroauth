import type { Request, Response } from "express";
import postService from "./post.service.js";
import type { ChannelLanguage } from "./dto/fetch-posts.dto.js";

class PostController {
  async fetchPosts(req: Request, res: Response) {
    const result = await postService.fetchPosts(
      req.params.language as ChannelLanguage,
    );

    return res.json(result);
  }
  async fetchImage(req: Request, res: Response) {
    const result = await postService.fetchCachedImage(req.params.id as string);

    res.set({
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    return res.send(result);
  }
}

export default new PostController();
