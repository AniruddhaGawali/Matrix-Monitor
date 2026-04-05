export const getSeverityColor = (count: number, isTarget: boolean = false) => {
  if (isTarget) return "#0088ff";
  if (count > 8) return "var(--tred)";
  if (count > 5) return "var(--torange)";
  if (count > 2) return "var(--tamber)";
  return "var(--tamber)";
};

export const getSeverityColorCode = (count: number) => {
  if (count > 8) return "#ff0000";
  if (count > 5) return "#ff6600";
  if (count > 2) return "#ffcc00";
  return "#ffcc00";
};

export const getDotSize = (count: number) => {
  if (count > 10) return 25;
  if (count > 8) return 22;
  if (count > 5) return 18;
  if (count > 2) return 14;
  return 8;
};

export const getDotTextColor = (count: number, isTarget: boolean = false) => {
  if (isTarget) return "var(--twhite)";
  if (count > 8) return "var(--twhite)";
  if (count > 5) return "var(--twhite)";
  return "var(--tblack)";
};
