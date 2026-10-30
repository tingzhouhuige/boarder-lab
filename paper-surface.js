// Fine sketch-paper tooth, with stable material variation per photo.
class PaperSurface {
  constructor() {
    this.cache = new Map();
    this.images = [];
    this.ready = Promise.all(['assets/paper-cotton-surface.png', 'assets/paper-cotton-surface-2.png'].map((src) => {
      const image = new Image();
      this.images.push(image);
      return new Promise((resolve) => {
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = src;
      });
    })).then((loaded) => loaded.every(Boolean));
  }

  sheet(width, height, identity) {
    const w = Math.round(1600 * width / Math.max(width, height));
    const h = Math.round(1600 * height / Math.max(width, height));
    const key = `${w}:${h}:${identity}`;
    if (this.cache.has(key)) return this.cache.get(key);
    let seed = 2166136261;
    for (const char of identity) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
    const image = this.images[seed % this.images.length];
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.floor(random() * 4) * Math.PI / 2);
    ctx.scale(random() < 0.5 ? -1 : 1, 1);
    const extent = Math.max(w, h) * (1.03 + random() * 0.14);
    ctx.drawImage(image, -extent / 2, -extent / 2, extent, extent);
    ctx.restore();
    // Remove broad lighting and crease shadows, retaining only fine paper tooth.
    const softened = document.createElement('canvas');
    softened.width = w;
    softened.height = h;
    const softCtx = softened.getContext('2d');
    softCtx.filter = 'blur(7px)';
    softCtx.drawImage(canvas, 0, 0);
    const pixels = ctx.getImageData(0, 0, w, h);
    const lowFrequency = softCtx.getImageData(0, 0, w, h).data;
    for (let i = 0; i < pixels.data.length; i += 4) {
      const luminance = pixels.data[i] * 0.2126 + pixels.data[i + 1] * 0.7152 + pixels.data[i + 2] * 0.0722;
      const localMean = lowFrequency[i] * 0.2126 + lowFrequency[i + 1] * 0.7152 + lowFrequency[i + 2] * 0.0722;
      const shade = Math.max(238, Math.min(255, 248 + (luminance - localMean) * 0.55));
      pixels.data[i] = shade;
      pixels.data[i + 1] = shade;
      pixels.data[i + 2] = shade;
      pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    if (this.cache.size >= 5) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, canvas);
    return canvas;
  }

  apply(canvas, strength, identity) {
    if (!strength || this.images.some((image) => !image.complete || !image.naturalWidth)) return;
    const ctx = canvas.getContext('2d');
    const layer = document.createElement('canvas');
    layer.width = canvas.width;
    layer.height = canvas.height;
    const surface = layer.getContext('2d');
    surface.drawImage(canvas, 0, 0);
    surface.globalCompositeOperation = 'source-in';
    surface.drawImage(this.sheet(canvas.width, canvas.height, identity), 0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = Math.min(1, strength * 0.85);
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }
}

window.paperSurface = new PaperSurface();
