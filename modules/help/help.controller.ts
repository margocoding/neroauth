import type { Request, Response } from "express";
import helpService from "./help.service.js";
import config from "../../config/config.js";

class HelpController {
  async fetchVideo(req: Request, res: Response) {
    const rangeHeader = req.headers.range;

    const { stream, start, end, chunkSize, fileSize } =
      await helpService.fetchVideo(req.query.locale as string, rangeHeader);

    const headers: { [key: string]: string } = {
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=31536000",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD",
      "Access-Control-Allow-Headers": "Range",
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
    };

    if (rangeHeader) {
      headers["Content-Range"] = `bytes ${start}-${end}/${fileSize}`;
      res.status(206);
    } else {
      res.status(200);
    }

    res.set(headers);
    stream.pipe(res);
  }

  async download(req: Request, res: Response) {
    const fileName = req.query.fileName as string;
    const {stream, size} = await helpService.downloadFile(fileName)
    const headers = {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": size,
      "Cache-Control": "no-cache",
      ...config.securityHeaders,
    };

    res.set(headers);
    stream.pipe(res);
  }
}

export default new HelpController();
