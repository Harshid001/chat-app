const ImageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
const { UploadError, providerUploadError } = require("./upload-error");
const privateKey = () =>
  process.env.IMAGEKIT_PRIVATE_KEY?.trim() ||
  process.env.IMAGEKIT_KEY?.trim() ||
  "";
const hasImageKitConfig = () => Boolean(privateKey());

async function uploadChatMedia(file) {
  if (!hasImageKitConfig())
    throw new UploadError(
      "UPLOAD_CONFIGURATION",
      503,
      "Attachments are not configured yet. You can send text now; contact support if this continues.",
    );
  try {
    const client = new ImageKit({
      privateKey: privateKey(),
      timeout: 60000,
      maxRetries: 0,
    });
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `chat-${Date.now()}-${safeName}`;
    const result = await client.files.upload({
      file: await toFile(file.buffer, fileName, { type: file.mimetype }),
      fileName,
      folder: "/chatsdata",
    });
    if (!result.url || !result.url.startsWith("https://"))
      throw new Error("Invalid upload response");
    return result.url;
  } catch (error) {
    console.error("Media provider failed:", {
      type: error.constructor?.name || error.name,
      status: error.status,
    });
    throw providerUploadError(error);
  }
}
module.exports = { uploadChatMedia, hasImageKitConfig };
