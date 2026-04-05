import { useGlobeStore } from "@/store/use-globe-store";
import { AttackCategory } from "@/types/enum";
import Image from "next/image";

export default function IPDetail() {
  const { resetLocation, targetLocation } = useGlobeStore((state) => state);

  if (!targetLocation) return null;

  return (
    <div className="absolute -translate-y-1/2 top-1/2 right-4 w-1/4 h-2/3 max-w-100 z-50">
      <div className="terminal-box h-full w-full p-4 flex flex-col">
        <div className="corner top-left">+</div>
        <div className="corner top-right">+</div>
        <div className="corner bottom-left">+</div>
        <div className="corner bottom-right">+</div>

        {/* Title always at top */}
        <div className="flex items-center justify-between mb-4 text-2xl">
          <h2 className="font-bold text-center shrink-0">
            {targetLocation.ipAddress}
          </h2>
          <i
            className="ri-close-line cursor-pointer"
            onClick={resetLocation}
          ></i>
        </div>

        {/* Remaining space centers content */}
        <div className="flex-1 flex flex-col gap-4 justify-center">
          <div className="flex gap-4 text-2xl items-center">
            <i className="ri-send-plane-line"></i>
            <p className="text-center text-lg">
              Lat: {targetLocation.latitude}
              <br />
              Lng: {targetLocation.longitude}
            </p>
          </div>
          <div className="flex gap-4 text-2xl items-center">
            <i className="ri-alarm-warning-line"></i>
            <p className="text-center text-lg">
              Confidence: {targetLocation.confidenceScore}
            </p>
          </div>

          {targetLocation.attackCategories.length > 0 && (
            <div className="flex gap-4 text-2xl items-center">
              <i className="ri-shapes-line"></i>
              <div className="text-center text-lg flex gap-1 flex-wrap">
                {targetLocation.attackCategories.map((category) => (
                  <span key={category}>#{AttackCategory[category]}</span>
                ))}
              </div>
            </div>
          )}

          {targetLocation.victimCountryCode.length > 0 && (
            <div className="flex gap-4 text-2xl items-center">
              <i className="ri-global-line"></i>
              <div className="text-center text-lg flex gap-1 flex-wrap">
                {targetLocation.victimCountryCode.map((country, index) => (
                  <div
                    className=" flex items-center gap-1"
                    key={country + index}
                  >
                    <Image
                      width={24}
                      height={24}
                      src={`https://flagsapi.com/${country}/flat/24.png`}
                      alt={country}
                    />
                    {country}
                    {index < targetLocation.victimCountryCode.length - 1
                      ? ","
                      : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
