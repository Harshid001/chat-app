const ImageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
const hasImageKitConfig = () => Boolean(process.env.IMAGEKIT_KEY);

async function uploadChatMedia(file) {
  const client = new ImageKit({ privateKey: process.env.IMAGEKIT_KEY });
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `chat-${Date.now()}-${safeName}`;
  const result = await client.files.upload({
    file: await toFile(file.buffer, fileName, { type: file.mimetype }),
    fileName,
    folder: "/chatsdata",
  });
  return result.url;
}
module.exports = { uploadChatMedia, hasImageKitConfig };
