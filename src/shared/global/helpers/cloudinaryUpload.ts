import clodinary, { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { Promise } from "mongoose";

export function uploads(
    file: string,
    public_id?: string,
    overwrite?: boolean,
    invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {

    return new Promise((resolve: (res: UploadApiErrorResponse | UploadApiResponse | undefined) => void) => {
        clodinary.v2.uploader.upload(
            file, {
            public_id, overwrite, invalidate
        }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) resolve(error);
            resolve(result);
        })
    })
}