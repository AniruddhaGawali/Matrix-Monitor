import { useState, useEffect, useMemo, useCallback } from "react";

export function useGlobeMapDots(imageUrl: string) {
  const [globeDots, setGlobeDots] = useState<{ lat: number; lng: number }[]>(
    [],
  );

  const generateDotsFromImage = useCallback(() => {
    const activeLatLon: Record<number, number[]> = {};
    const dotSphereRadius = 20;

    const readImageData = (imageData: Uint8ClampedArray) => {
      for (
        let i = 0, lon = -180, lat = 90;
        i < imageData.length;
        i += 4, lon++
      ) {
        if (!activeLatLon[lat]) activeLatLon[lat] = [];
        if (
          imageData[i] < 80 &&
          imageData[i + 1] < 80 &&
          imageData[i + 2] < 80
        ) {
          activeLatLon[lat].push(lon);
        }
        if (lon === 180) {
          lon = -180;
          lat--;
        }
      }
    };

    const visibilityForCoordinate = (lon: number, lat: number) => {
      if (!activeLatLon[lat]?.length) return false;
      const closest = activeLatLon[lat].reduce((prev, curr) =>
        Math.abs(curr - lon) < Math.abs(prev - lon) ? curr : prev,
      );
      return Math.abs(lon - closest) < 0.5;
    };

    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const imageCanvas = document.createElement("canvas");
      imageCanvas.width = image.width;
      imageCanvas.height = image.height;
      const context = imageCanvas.getContext("2d");
      if (!context) return;

      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(
        0,
        0,
        imageCanvas.width,
        imageCanvas.height,
      );
      readImageData(imageData.data);

      const dots: { lat: number; lng: number }[] = [];
      const dotDensity = 2.2;

      for (let lat = 90; lat > -90; lat--) {
        const radius =
          Math.cos(Math.abs(lat) * (Math.PI / 180)) * dotSphereRadius;
        const dotsForLat = radius * Math.PI * 2 * dotDensity;
        for (let x = 0; x < dotsForLat; x++) {
          const long = -180 + (x * 360) / dotsForLat;
          if (visibilityForCoordinate(long, lat)) {
            dots.push({ lat, lng: long });
          }
        }
      }
      setGlobeDots(dots);
    };
  }, [imageUrl]);

  useEffect(() => {
    generateDotsFromImage();
  }, [generateDotsFromImage]);

  return globeDots;
}
