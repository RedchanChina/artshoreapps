import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 将 next-intl locale 字符串转为数据层使用的 "zh" | "en" */
export function toLocale(locale: string): "zh" | "en" {
  return locale === "en" ? "en" : "zh";
}

/**
 * 压缩图片到目标大小以下（基于 Canvas 重绘 + JPEG 质量递减）。
 * - 若原图小于 maxSize，直接返回原 File
 * - 否则逐步降低质量 / 缩放尺寸直至满足限制
 * @param file 原始图片文件（JPEG / PNG）
 * @param maxSize 单位字节，默认 2MB
 * @returns 压缩后的 File（统一为 image/jpeg）
 */
export async function compressImage(
  file: File,
  maxSize: number = 2 * 1024 * 1024,
): Promise<File> {
  if (file.size <= maxSize) return file;

  const img = await loadImage(file);
  let { width, height } = img;

  // 尺寸上限 1200px，避免极端大图导致 canvas 过大
  const MAX_DIM = 1200;
  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  // 逐步降低质量直至满足大小限制
  let quality = 0.9;
  let blob = await canvasToBlob(canvas, "image/jpeg", quality);
  while (blob && blob.size > maxSize && quality > 0.3) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  if (!blob) return file;
  return new File([blob], file.name.replace(/\.(png|jpe?g)$/i, ".jpg"), {
    type: "image/jpeg",
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}
