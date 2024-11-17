const { app, input, output } = require("@azure/functions");
const { Jimp } = require("jimp");

const availableExt = ["jpg", "jpeg", "png", "bmp", "gif", "tiff"];

async function resize(url) {
  return Jimp.read(url).then((image) => {
    image.resize(100, Jimp.AUTO)
      .getBuffer(Jimp.MIME_JPEG, (error, stream) => {
        if (error) {
          ctx.log("error");
          ctx.done(error);
        } else {
          ctx.log("done");
          ctx.done(null, stream);
        }
      });
  });
}

app.storageBlob('thumbnails', {
  path: 'images/{name}',
  connection: 'StorageConnection',
  handler: async (blob, context) => {
    context.log(`Storage blob 'process-blob-image' url:${context.triggerMetadata.uri}, size:${blob.length} bytes`);
    const url = context.triggerMetadata.uri;
    const ext = url.split('.').pop();

    if (!url) {
      return;
    } else if (!ext || !availableExt.includes(ext.toLowerCase())) {
      return;
    } else {
      const thumbnail = await resize(url);
      return thumbnail;
    }
  },
  return: output.storageBlob({
    path: 'thumbnails/{name}',
    connection: 'StorageConnection',
  })
});
