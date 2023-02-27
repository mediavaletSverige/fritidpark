const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');

class storageHandler {
  constructor() {
    this.id = process.env.STORAGE_PROJECT_ID;
    this.key = process.env.STORAGE_KEY_FILE_NAME;
    this.BUCKET_NAME = 'fp_storage';
    this.storage = new Storage({
      projectId: this.id,
      keyFilename: this.key,
    });
    this.bucket = this.storage.bucket(this.BUCKET_NAME);
  }

  async uploadImage(file, name, size, format, quality) {
    const buffer = await sharp(file.buffer)
      .resize(...size)
      .toFormat(format)
      .jpeg({ quality })
      .toBuffer();
    this.bucket.file(`public/img/articles/${name}`).createWriteStream().end(buffer);
  }

  async deleteImages(id) {
    const [files] = await this.bucket.getFiles();
    const articleFiles = files.filter((image) => image.name.includes(id));
    await Promise.all(articleFiles.map((image) => image.delete()));
  }

  async deleteImage(id, img) {
    await this.bucket.file(`public/img/articles/article-${id}-img${img}.jpeg`).delete();
  }

  async checkImage(img) {
    return await this.bucket.file(img).exists()[0];
  }

  async renameImageFile(oldImg, newImg) {
    await this.bucket.file(oldImg).move(this.bucket.file(newImg));
  }
}

module.exports = storageHandler;
