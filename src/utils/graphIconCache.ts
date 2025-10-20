import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { LucideIcon } from 'lucide-react';
import { getEntityTypeConfig } from '@/config/entityTypeConfig';
import { EntityType } from '@/types/entities';

/**
 * Creates an HTMLImageElement from a Lucide React icon
 * This allows us to render React icons in canvas using ctx.drawImage()
 */
const createIconImage = async (
  Icon: LucideIcon,
  color: string,
  size: number = 24
): Promise<HTMLImageElement> => {
  // 1. Create temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  try {
    // 2. Render React icon to container using React DOM
    const root = createRoot(container);
    await new Promise<void>((resolve) => {
      // Properly create React element from component
      const IconElement = createElement(Icon, { color, size, strokeWidth: 2 });
      root.render(IconElement);
      // Wait for React to render
      setTimeout(resolve, 10);
    });

    // 3. Get SVG element
    const svg = container.querySelector('svg');
    if (!svg) {
      throw new Error('SVG not found after rendering');
    }

    // 4. Convert SVG to image blob
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // 5. Create image from blob
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });

    // 6. Cleanup
    root.unmount();
    document.body.removeChild(container);
    URL.revokeObjectURL(url);

    return img;
  } catch (error) {
    // Cleanup on error
    document.body.removeChild(container);
    throw error;
  }
};

/**
 * Creates a cache of icon images for all entity types
 * This is called once when the graph mounts to pre-render all icons
 */
export const createIconCache = async (): Promise<Map<EntityType, HTMLImageElement>> => {
  const cache = new Map<EntityType, HTMLImageElement>();
  
  // Get all entity type configs
  const configs = [
    { value: 'pc' as EntityType, color: '#059669' },
    { value: 'npc' as EntityType, color: '#3b82f6' },
    { value: 'race' as EntityType, color: '#0d9488' },
    { value: 'religion' as EntityType, color: '#d97706' },
    { value: 'quest' as EntityType, color: '#4f46e5' },
    { value: 'enemy' as EntityType, color: '#dc2626' },
    { value: 'location' as EntityType, color: '#7c3aed' },
    { value: 'organization' as EntityType, color: '#e11d48' },
    { value: 'item' as EntityType, color: '#eab308' },
    { value: 'plot-thread' as EntityType, color: '#8b5cf6' },
  ];

  // Create images in parallel
  await Promise.all(
    configs.map(async ({ value, color }) => {
      const config = getEntityTypeConfig(value);
      if (config?.icon) {
        try {
          const img = await createIconImage(config.icon, color, 24);
          cache.set(value, img);
        } catch (error) {
          console.error(`Failed to create icon for ${value}:`, error);
        }
      }
    })
  );

  console.log('[GraphIconCache] Created icon cache with', cache.size, 'icons');
  return cache;
};

/**
 * Draws an icon image on canvas
 */
export const drawIcon = (
  ctx: CanvasRenderingContext2D,
  iconImage: HTMLImageElement,
  x: number,
  y: number,
  size: number
) => {
  ctx.drawImage(iconImage, x - size / 2, y - size / 2, size, size);
};
