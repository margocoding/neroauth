import * as fs from 'fs';
import path from 'path';
import type { SuccessRdo } from '../../utils/rdo/success.rdo.js';

class StorageService {
    async uploadFile(buffer: Buffer, folder: string, filename: string): Promise<string> {
        const finalPath = path.join('uploads', folder, filename);
        fs.appendFileSync(`/uploads/${folder}/${filename}`, buffer);

        return finalPath;
    }

    async deleteFile(folder: string, filename: string): Promise<SuccessRdo> {
        try {
            const finalPath = path.join('uploads', folder, filename);
            fs.unlinkSync(finalPath);

            return {success: true};
        } catch(e) {
            console.error(e);
            return {success: false}
        }
    }
}

export default new StorageService();