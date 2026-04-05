type Attack = {
  id: string;
  ipAddress: string;
  confidenceScore: number;
  attackCategories: number[];
  latitude: number;
  longitude: number;
  victimCountryCode: string[];
  timeStamp: string;
};

type IPPoint = {
  lat: number;
  lng: number;
  ip: string;
  label?: string;
};

type ArcData = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
};
