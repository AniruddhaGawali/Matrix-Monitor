"use client";

import React, { useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { GlobeMethods } from "react-globe.gl";

import { useGlobeStore } from "@/store/use-globe-store";
import { optimizedCombinedCluster } from "@/components/otherAlgo";
import { getSeverityColorCode } from "@/components/globle/utils";
import { createGlobeMarker } from "@/components/globle/createGlobeMarker";
import { useGlobeMapDots } from "@/components/globle/useGlobleMapDot";
import country_code_cordinates from "@/data/country_code_cordinates.json";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type Props = { attacks?: Attack[] };

export default function AttackGlobe({ attacks }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const { targetLocation, setTargetLocation } = useGlobeStore((state) => state);

  // Custom Hook for map generation
  const globeDots = useGlobeMapDots("/world_alpha_mini.jpg");

  const ipPoints: IPPoint[] = useMemo(
    () =>
      attacks
        ? attacks.map((attack) => ({
            lat: attack.latitude,
            lng: attack.longitude,
            ip: attack.ipAddress,
            label: `Attack from ${attack.ipAddress} with confidence ${attack.confidenceScore}`,
          }))
        : [],
    [attacks],
  );

  // Data processing memos
  const labelData = useMemo(() => {
    const groupedPoints = optimizedCombinedCluster(ipPoints, 2, 10);
    return groupedPoints.map((group) => ({
      ...group[0],
      lat: group.reduce((sum, p) => sum + p.lat, 0) / group.length,
      lng: group.reduce((sum, p) => sum + p.lng, 0) / group.length,
      _group: group,
    }));
  }, [ipPoints]);

  const attackArcs = useMemo(() => {
    if (!targetLocation?.victimCountryCode) return [];

    const codes = Array.isArray(targetLocation.victimCountryCode)
      ? targetLocation.victimCountryCode
      : [targetLocation.victimCountryCode];

    return codes
      .map((c) => {
        const victimCountry = country_code_cordinates.find(
          (item) => item["Alpha-2 code"] === c,
        );
        if (!victimCountry) return undefined;

        return {
          startLat: Number(targetLocation.latitude),
          startLng: Number(targetLocation.longitude),
          endLat: Number(victimCountry["Latitude (average)"]),
          endLng: Number(victimCountry["Longitude (average)"]),
          color: getSeverityColorCode(codes.length),
        };
      })
      .filter(Boolean) as ArcData[];
  }, [targetLocation]);

  const victimImpacts = useMemo(
    () =>
      attackArcs.map((arc) => ({
        lat: arc.endLat,
        lng: arc.endLng,
        color: arc.color,
      })),
    [attackArcs],
  );

  // Handle zooming to target
  useEffect(() => {
    if (targetLocation && globeRef.current) {
      globeRef.current.pointOfView(
        {
          lat: targetLocation.latitude,
          lng: targetLocation.longitude,
          altitude: 0.5,
        },
        1500,
      );
    }
  }, [targetLocation]);

  // Handle marker clicks
  const handleIpClick = useCallback(
    (ip: string) => {
      const found = attacks?.find((item) => item.ipAddress === ip);
      if (found) setTargetLocation(found);
    },
    [attacks, setTargetLocation],
  );

  const renderMarker = useCallback(
    (d: object) =>
      createGlobeMarker(d as any, targetLocation?.ipAddress, handleIpClick),
    [targetLocation?.ipAddress, handleIpClick],
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        showGlobe={false}
        showAtmosphere={true}
        atmosphereColor="#003300"
        atmosphereAltitude={0.15}
        // --- LAND DOTS ---
        pointsData={globeDots}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "#008800"}
        pointAltitude={0.001}
        pointRadius={0.15}
        // --- ATTACK ARCS ---
        arcsData={attackArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude={0.16} // <- remove Math.random per frame
        arcStroke={0.2}
        // --- VICTIM IMPACT RINGS ---
        ringsData={victimImpacts}
        ringLat="lat"
        ringLng="lng"
        ringColor={(d: any) => d.color}
        ringMaxRadius={2.5}
        ringPropagationSpeed={1.5}
        ringRepeatPeriod={800}
        // --- IP POSITIONS (RED DOTS) ---
        htmlElementsData={labelData}
        htmlLat="lat"
        htmlLng="lng"
        htmlTransitionDuration={0}
        htmlElement={renderMarker} // <- stable callback
      />
    </div>
  );
}
