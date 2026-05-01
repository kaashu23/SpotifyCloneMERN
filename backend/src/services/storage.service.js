const ImageKit = require('@imagekit/nodejs');

// Newer ImageKit SDKs require publicKey and urlEndpoint in the constructor.
// We use fallback dummy values if they are not provided in .env.
const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_key_dummy",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy"
});

async function uploadFile(fileBuffer, fileName, folder) {
    try {
        if (!fileBuffer) {
            throw new Error("No file buffer provided for upload");
        }

        const key = process.env.IMAGEKIT_PRIVATE_KEY || "";
        console.log(`[StorageService] Uploading ${fileName} to ${folder}. Buffer size: ${fileBuffer.length} bytes`);
        
        if (!key) {
            throw new Error("IMAGEKIT_PRIVATE_KEY is missing in .env file");
        }

        // Convert Buffer to base64 string as it's the most reliable format for the SDK
        const fileBase64 = fileBuffer.toString('base64');

        const result = await imagekit.files.upload({
            file: fileBase64,
            fileName: fileName.replace(/[^a-z0-9.]/gi, '_'), // Sanitize filename
            folder: folder,
            useUniqueFileName: true
        });

        console.log(`[StorageService] Upload successful! URL: ${result.url}`);
        return result;
    } catch (error) {
        console.error("[StorageService] ImageKit upload error detail:", error);
        throw error;
    }
}

module.exports = {
    uploadFile
};