import sharp from 'sharp';

export interface ProcessedImage {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
}

export async function processImageForAI(file: File): Promise<ProcessedImage> {
  const buffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(buffer);

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  let processed = image;

  if (metadata.width && metadata.height) {
    const isDark = await checkIfImageIsDark(inputBuffer);
    
    if (isDark) {
      processed = processed.linear(1.3, -(128 * 0.3));
    }

    if (metadata.width > 2048 || metadata.height > 2048) {
      const scale = 2048 / Math.max(metadata.width, metadata.height);
      processed = processed.resize(Math.round(metadata.width * scale), Math.round(metadata.height * scale), {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }

  const outputBuffer = await processed
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  return {
    base64: outputBuffer.toString('base64'),
    mimeType: 'image/jpeg',
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

async function checkIfImageIsDark(buffer: Buffer): Promise<boolean> {
  const { data, info } = await sharp(buffer)
    .resize(100, 100, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let totalBrightness = 0;
  const pixelCount = info.width * info.height;

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * info.channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    totalBrightness += brightness;
  }

  const avgBrightness = totalBrightness / pixelCount;
  return avgBrightness < 80;
}

export async function processMultipleImages(
  files: File[]
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];
  
  for (const file of files) {
    if (file.size > 0 && file.type.startsWith('image/')) {
      try {
        const processed = await processImageForAI(file);
        results.push(processed);
      } catch (err) {
        console.error(`Failed to process image ${file.name}:`, err);
      }
    }
  }
  
  return results;
}
