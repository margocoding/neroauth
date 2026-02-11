import {createReadStream, lstatSync, statSync} from "fs";
import config from "../../config/config.js";
import {normalize, resolve} from "path";
import HttpError from "../../utils/exceptions/HttpError.js";

class HelpService {
    async fetchVideo(locale: string, rangeHeader: any) {
        try {
            if (!config.allowedLocales.includes(locale)) {
                throw HttpError.BadRequest("Invalid locale");
            }

            const helpDir = resolve(process.cwd(), "uploads", "help");
            const videoPath = resolve(helpDir, locale, "adb.mp4");
            const normalizedPath = normalize(videoPath);

            if (!normalizedPath.startsWith(helpDir)) {
                throw HttpError.BadRequest("Access denied");
            }

            const stats = statSync(normalizedPath);
            const lstat = lstatSync(normalizedPath);
            const fileSize = stats.size;

            if (!stats.isFile()) {
                throw HttpError.BadRequest("Video file not found");
            }

            if (lstat.isSymbolicLink()) {
                throw HttpError.BadRequest("Access denied");
            }

            if (!this.isValidFileSize(fileSize, config.maxFileSize.videos)) {
                throw HttpError.BadRequest("File too large");
            }

            if (rangeHeader) {
                const parts = rangeHeader.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunkSize = end - start + 1;

                const stream = createReadStream(normalizedPath, {start, end});
                return {
                    stream, start, end, chunkSize, fileSize,
                };
            } else {
                const stream = createReadStream(normalizedPath);
                return {
                    stream, start: 0, end: fileSize - 1, chunkSize: fileSize, fileSize,
                };
            }
        } catch (error) {
            console.error(error);
            throw HttpError.NotFound("Video file not found");
        }
    }

    isValidFileSize(fileSize: number, maxSize: number) {
        return fileSize <= maxSize;
    }

    isValidFileExtension(filename: string, allowedExtensions: string[]) {
        if (!filename || typeof filename !== 'string') return false;

        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return allowedExtensions.includes(extension);
    }

    async downloadFile(fileName: string) {
        const downloadsDir = resolve(process.cwd(), "uploads", "downloads");
        const requestedPath = resolve(downloadsDir, fileName);
        const normalizedPath = normalize(requestedPath);

        if (!normalizedPath.startsWith(downloadsDir)) {
            throw new HttpError(403, 'Access denied');
        }

        if (!this.isValidFileExtension(fileName, config.allowedExtensions.downloads)) {
            throw HttpError.BadRequest('Wrong file format')
        }

        try {
            const stats = statSync(normalizedPath);
            const lstat = lstatSync(normalizedPath);

            if (!stats.isFile()) {
                throw HttpError.NotFound('File not found');
            }

            if (lstat.isSymbolicLink()) {
                throw new HttpError(403, 'Access denied');
            }

            return {stream: createReadStream(normalizedPath), size: stats.size};
        } catch (error: any) {
            if (error.code === "ENOENT") {
                throw HttpError.BadRequest("File not found");
            }
            throw new Error(error);
        }
    }
}

export default new HelpService();
