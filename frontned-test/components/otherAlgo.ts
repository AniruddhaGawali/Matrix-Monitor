import countriesData from "@/data/country_code_cordinates.json";

type Cluster = {
  centroid: { lat: number; lng: number };
  points: IPPoint[];
};

// Group IPs that are close to each other (within ~1 degree)
function groupNearbyPoints(points: IPPoint[], threshold = 1): IPPoint[][] {
  const used = new Set<number>();
  const groups: IPPoint[][] = [];

  points.forEach((point, i) => {
    if (used.has(i)) return;
    const group = [point];
    used.add(i);
    points.forEach((other, j) => {
      if (used.has(j)) return;
      const latDiff = Math.abs(point.lat - other.lat);
      const lngDiff = Math.abs(point.lng - other.lng);
      if (latDiff < threshold && lngDiff < threshold) {
        group.push(other);
        used.add(j);
      }
    });
    groups.push(group);
  });

  return groups;
}

function kMeansGroup(
  points: IPPoint[],
  k: number = 5,
  iterations: number = 10,
) {
  if (points.length <= k) return points.map((p) => [p]);

  // 1. Initialize: Pick random points as starting centroids
  let centroids = points.slice(0, k).map((p) => ({ lat: p.lat, lng: p.lng }));
  let clusters: IPPoint[][] = Array.from({ length: k }, () => []);

  for (let iter = 0; iter < iterations; iter++) {
    clusters = Array.from({ length: k }, () => []);

    // 2. Assignment: Put each point in the cluster of the nearest centroid
    points.forEach((point) => {
      let minDist = Infinity;
      let clusterIndex = 0;

      centroids.forEach((centroid, idx) => {
        // Euclidean Distance Formula
        const dist = Math.sqrt(
          Math.pow(point.lat - centroid.lat, 2) +
            Math.pow(point.lng - centroid.lng, 2),
        );
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = idx;
        }
      });
      clusters[clusterIndex].push(point);
    });

    // 3. Update: Move centroids to the center of their new clusters
    centroids = clusters.map((cluster) => {
      if (cluster.length === 0) return { lat: 0, lng: 0 };
      const avgLat =
        cluster.reduce((sum, p) => sum + p.lat, 0) / cluster.length;
      const avgLng =
        cluster.reduce((sum, p) => sum + p.lng, 0) / cluster.length;
      return { lat: avgLat, lng: avgLng };
    });
  }

  return clusters.filter((c) => c.length > 0);
}
// maxDistance determines how "far" IPs can be to still merge.
// 2 degrees is roughly 222km.
function autoCluster(points: IPPoint[], maxDistance: number = 2): IPPoint[][] {
  const clusters: Cluster[] = [];

  points.forEach((point) => {
    let nearestCluster: Cluster | null = null;
    let minDistance: number = Infinity;

    // 1. Find the closest existing cluster
    clusters.forEach((cluster) => {
      const dist = Math.sqrt(
        Math.pow(point.lat - cluster.centroid.lat, 2) +
          Math.pow(point.lng - cluster.centroid.lng, 2),
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestCluster = cluster;
      }
    });

    // 2. If it's close enough, join the cluster and recalculate the center
    if (nearestCluster !== null && minDistance <= maxDistance) {
      const cluster = nearestCluster as Cluster;
      cluster.points.push(point);

      // Update the centroid to the new center of gravity
      const len = cluster.points.length;
      cluster.centroid.lat =
        (cluster.centroid.lat * (len - 1) + point.lat) / len;
      cluster.centroid.lng =
        (cluster.centroid.lng * (len - 1) + point.lng) / len;
    } else {
      // 3. Too far away! Create a new cluster automatically
      clusters.push({
        centroid: { lat: point.lat, lng: point.lng },
        points: [point],
      });
    }
  });

  // Extract just the arrays of points to match your original component's expected format
  return clusters.map((c) => c.points);
}

function combinedCluster(
  points: IPPoint[],
  maxDistance: number = 2,
  iterations: number = 10,
): IPPoint[][] {
  if (points.length === 0) return [];

  // ==========================================
  // PHASE 1: Auto-Cluster to find 'k'
  // ==========================================
  const initialClusters: Cluster[] = [];

  points.forEach((point) => {
    let nearestCluster: Cluster | null = null;
    let minDistance: number = Infinity;

    // Find the closest existing cluster
    initialClusters.forEach((cluster) => {
      const dist = Math.sqrt(
        Math.pow(point.lat - cluster.centroid.lat, 2) +
          Math.pow(point.lng - cluster.centroid.lng, 2),
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestCluster = cluster;
      }
    });

    // Join if close enough, else create new
    if (nearestCluster !== null && minDistance <= maxDistance) {
      const cluster = nearestCluster as Cluster;
      cluster.points.push(point);
      const len = cluster.points.length;
      cluster.centroid.lat =
        (cluster.centroid.lat * (len - 1) + point.lat) / len;
      cluster.centroid.lng =
        (cluster.centroid.lng * (len - 1) + point.lng) / len;
    } else {
      initialClusters.push({
        centroid: { lat: point.lat, lng: point.lng },
        points: [point],
      });
    }
  });

  // The number of clusters we discovered is our 'k'
  const k = initialClusters.length;

  // If we only found 1 cluster, or we have fewer points than clusters, skip K-Means
  if (k <= 1 || points.length <= k) {
    return initialClusters.map((c) => c.points);
  }

  // ==========================================
  // PHASE 2: K-Means Optimization
  // ==========================================
  // We use the centroids from Phase 1 as our starting points instead of random ones!
  let centroids = initialClusters.map((c) => ({
    lat: c.centroid.lat,
    lng: c.centroid.lng,
  }));
  let finalClusters: IPPoint[][] = [];

  for (let iter = 0; iter < iterations; iter++) {
    finalClusters = Array.from({ length: k }, () => []);

    // 1. Assignment: Put each point in the cluster of the nearest centroid
    points.forEach((point) => {
      let minDist = Infinity;
      let clusterIndex = 0;

      centroids.forEach((centroid, idx) => {
        const dist = Math.sqrt(
          Math.pow(point.lat - centroid.lat, 2) +
            Math.pow(point.lng - centroid.lng, 2),
        );
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = idx;
        }
      });
      finalClusters[clusterIndex].push(point);
    });

    // 2. Update: Move centroids to the exact center of their new clusters
    centroids = finalClusters.map((cluster) => {
      if (cluster.length === 0) return { lat: 0, lng: 0 };
      const avgLat =
        cluster.reduce((sum, p) => sum + p.lat, 0) / cluster.length;
      const avgLng =
        cluster.reduce((sum, p) => sum + p.lng, 0) / cluster.length;
      return { lat: avgLat, lng: avgLng };
    });
  }

  // Filter out any accidentally empty clusters and return
  return finalClusters.filter((c) => c.length > 0);
}
// Build a lookup map: country code -> { lat, lng }
const countryCoords = new Map<string, { lat: number; lng: number }>();
countriesData.forEach((c) => {
  countryCoords.set(c["Alpha-2 code"].toUpperCase(), {
    lat: c["Latitude (average)"],
    lng: c["Longitude (average)"],
  });
  countryCoords.set(c["Alpha-3 code"].toUpperCase(), {
    lat: c["Latitude (average)"],
    lng: c["Longitude (average)"],
  });
});
// Build arcs from attacker IP → each victim country
const attackArcs = (data: Attack[]) => {
  if (!data) return [];

  // Step 1: Group IPs the same way the globe clusters them (grid-based, ~2° cells)
  const grid = new Map<
    string,
    { lat: number; lng: number; attacks: Attack[] }
  >();

  data.forEach((attack) => {
    const cellX = Math.floor(attack.longitude / 2);
    const cellY = Math.floor(attack.latitude / 2);
    const key = `${cellX},${cellY}`;

    if (!grid.has(key)) {
      grid.set(key, { lat: 0, lng: 0, attacks: [] });
    }
    grid.get(key)!.attacks.push(attack);
  });

  // Step 2: For each cluster, compute centroid + collect unique victim countries
  const arcs: {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string[];
  }[] = [];

  grid.forEach((cluster) => {
    const { attacks } = cluster;

    // Centroid of the cluster (matches globe dot position)
    const centerLat =
      attacks.reduce((sum, a) => sum + a.latitude, 0) / attacks.length;
    const centerLng =
      attacks.reduce((sum, a) => sum + a.longitude, 0) / attacks.length;

    // Collect all unique victim country codes from all IPs in this cluster
    const uniqueDestinations = new Set<string>();
    attacks.forEach((attack) => {
      if (!attack.victimCountryCode || !Array.isArray(attack.victimCountryCode))
        return;
      attack.victimCountryCode.forEach((code: string) => {
        uniqueDestinations.add(code.toUpperCase());
      });
    });

    // One arc per unique destination from this cluster
    uniqueDestinations.forEach((code) => {
      const dest = countryCoords.get(code);
      if (!dest) return;

      arcs.push({
        startLat: centerLat,
        startLng: centerLng,
        endLat: dest.lat,
        endLng: dest.lng,
        color: ["#ff0000", "#ffaa00"],
      });
    });
  });

  return arcs;
};

export function optimizedCombinedCluster(
  points: IPPoint[],
  maxDistance: number = 2,
  iterations: number = 10,
): IPPoint[][] {
  if (points.length === 0) return [];

  // ==========================================
  // PHASE 1: Spatial Hashing (Grid Clustering)
  // Complexity: O(n) - Lightning Fast 🚀
  // ==========================================
  const grid = new Map<string, IPPoint[]>();

  points.forEach((point) => {
    // Math.floor groups coordinates into distinct "buckets" based on maxDistance
    const cellX = Math.floor(point.lng / maxDistance);
    const cellY = Math.floor(point.lat / maxDistance);
    const key = `${cellX},${cellY}`;

    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(point);
  });

  // Convert our grid map back into an array of initial clusters
  const initialClusters: Cluster[] = Array.from(grid.values()).map((group) => {
    // Calculate the rough center of this grid cell
    const avgLat = group.reduce((sum, p) => sum + p.lat, 0) / group.length;
    const avgLng = group.reduce((sum, p) => sum + p.lng, 0) / group.length;
    return {
      centroid: { lat: avgLat, lng: avgLng },
      points: group,
    };
  });

  const k = initialClusters.length;

  // If only 1 cluster or very few points, skip Phase 2 entirely
  if (k <= 1 || points.length <= k) {
    return initialClusters.map((c) => c.points);
  }

  // ==========================================
  // PHASE 2: K-Means Optimization
  // Complexity: O(n * k * iterations)
  // ==========================================
  let centroids = initialClusters.map((c) => ({
    lat: c.centroid.lat,
    lng: c.centroid.lng,
  }));
  let finalClusters: IPPoint[][] = [];

  for (let iter = 0; iter < iterations; iter++) {
    finalClusters = Array.from({ length: k }, () => []);

    // Assignment step
    points.forEach((point) => {
      let minDist = Infinity;
      let clusterIndex = 0;

      centroids.forEach((centroid, idx) => {
        // We can optimize this further by skipping Math.sqrt for comparisons!
        // a^2 + b^2 is enough to find the minimum distance relative to others.
        const distSquared =
          Math.pow(point.lat - centroid.lat, 2) +
          Math.pow(point.lng - centroid.lng, 2);

        if (distSquared < minDist) {
          minDist = distSquared;
          clusterIndex = idx;
        }
      });
      finalClusters[clusterIndex].push(point);
    });

    // Update step
    centroids = finalClusters.map((cluster) => {
      if (cluster.length === 0) return { lat: 0, lng: 0 };
      const avgLat =
        cluster.reduce((sum, p) => sum + p.lat, 0) / cluster.length;
      const avgLng =
        cluster.reduce((sum, p) => sum + p.lng, 0) / cluster.length;
      return { lat: avgLat, lng: avgLng };
    });
  }

  return finalClusters.filter((c) => c.length > 0);
}
