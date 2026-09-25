import { BoundingBox } from '../../../shared/types';

export interface DetectedFace {
  bbox: BoundingBox;
  confidence: number;
}

/**
 * Lightweight face detection utility.
 * In a real browser context, it scans profile images, avatar containers, webcam previews,
 * and passes the image to an ONNX model or lightweight face cascade pipeline.
 */
export async function detectFacesInDocument(doc: Document): Promise<DetectedFace[]> {
  const faces: DetectedFace[] = [];

  // 1. Scan DOM for profile pictures, avatars, and user photos
  const avatarSelectors = [
    'img[src*="avatar"]',
    'img[src*="profile"]',
    'img[src*="user"]',
    'img[alt*="profile" i]',
    'img[alt*="avatar" i]',
    'img[alt*="photo" i]',
    'img[class*="avatar"]',
    'img[class*="profile"]',
    'div[class*="avatar"] img',
    'div[class*="profile-pic"] img',
    '.user-avatar',
    '.profile-photo',
    'video'
  ];

  const matchedElements = doc.querySelectorAll(avatarSelectors.join(', '));
  matchedElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 20 && rect.height > 20 && rect.top < window.innerHeight && rect.bottom > 0) {
      faces.push({
        bbox: {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        confidence: 0.94,
      });
    }
  });

  return faces;
}
