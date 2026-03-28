import { UserTier } from '../types';

export const applyWatermark = (dataUrl: string, tier: UserTier): Promise<string> => {
  if (tier === UserTier.PREMIUM) return Promise.resolve(dataUrl);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Watermark Text (Repeated or Large Center)
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-45 * Math.PI / 180);
      const fontSize = Math.floor(canvas.width / 10);
      ctx.font = `900 ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = "10px";
      ctx.fillText('VISION_X OUTPUT', 0, 0);
      ctx.restore();

      // Bottom Logo
      const logoSize = Math.max(24, Math.floor(canvas.width / 20));
      const padding = Math.floor(canvas.width / 30);
      
      // Blue Box for V
      ctx.fillStyle = '#2563eb'; // blue-600
      const boxX = canvas.width / 2 - logoSize;
      const boxY = canvas.height - logoSize - padding;
      
      // Draw rounded rect manually for compatibility if needed, but roundRect is widely supported now
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, logoSize, logoSize, logoSize / 4);
        ctx.fill();
      } else {
        ctx.fillRect(boxX, boxY, logoSize, logoSize);
      }

      // V Text
      ctx.fillStyle = 'white';
      ctx.font = `900 ${Math.floor(logoSize * 0.7)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('V', boxX + logoSize / 2, boxY + logoSize / 2);

      // VISION-X Text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = `900 ${Math.floor(logoSize * 0.5)}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('VISION-X', boxX + logoSize + logoSize / 4, boxY + logoSize / 2);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
  });
};
