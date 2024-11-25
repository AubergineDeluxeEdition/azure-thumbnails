const { app, output } = require("@azure/functions");
const Jimp = require("jimp");

const availableExt = ["jpg", "jpeg", "png", "bmp", "gif", "tiff"];

// Fonction de redimensionnement d'image
async function resizeImage(url, context) {
  try {
    const image = await Jimp.read(url);
    const buffer = await image.resize(100, Jimp.AUTO).getBufferAsync(Jimp.MIME_JPEG);
    context.log("Image resized successfully");
    return buffer;
  } catch (error) {
    context.log(`Error resizing image: ${error}`);
    throw error;
  }
}

// Définition du BlobTrigger
app.storageBlob("thumbnails", {
  path: "images/{name}",
  connection: "AzureWebJobsStorage",
  handler: async (blob, context) => {
    const url = context.triggerMetadata.uri;
    const ext = url.split(".").pop().toLowerCase();

    context.log(`Blob URL: ${url}, Size: ${blob.length} bytes`);

    if (!availableExt.includes(ext)) {
      context.log(`Extension not supported: ${ext}`);
      return;
    }

    const resizedImage = await resizeImage(url, context);

    return resizedImage;
  },
  return: output.storageBlob({
    path: "thumbnails/{name}",
    connection: "AzureWebJobsStorage",
  }),
});
