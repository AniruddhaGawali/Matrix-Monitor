import {
  getDotSize,
  getSeverityColor,
  getDotTextColor,
} from "@/components/globle/utils";

type GlobeMarkerPoint = {
  ip: string;
};

type GlobeMarkerItem = {
  _group: GlobeMarkerPoint[];
};

export const createGlobeMarker = (
  item: GlobeMarkerItem,
  targetIp: string | undefined,
  onIpClick: (ip: string) => void,
) => {
  const isTarget = item._group.some((p: any) => p.ip === targetIp);
  const dotBgColor = getSeverityColor(item._group.length, isTarget);
  const dotColor = getDotTextColor(item._group.length, isTarget);
  const dotsize = getDotSize(item._group.length);

  // 1. Wrapper
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    pointer-events: auto; cursor: pointer; position: relative;
    display: flex; flex-direction: column; align-items: center; padding: 10px;
  `;

  // 2. Dynamic Pulse Dot
  const dot = document.createElement("div");
  dot.style.cssText = `
    width: ${dotsize}px; height: ${dotsize}px;
    background: ${dotBgColor}; border-radius: 50%;
    border: 2px solid ${dotBgColor}; box-shadow: 0 0 6px ${dotBgColor};
    pointer-events: none;
    z-index: 2;
  `;

  // 3. Tooltip
  const tooltip = document.createElement("ul");
  tooltip.style.cssText = `
    display: none; position: absolute; bottom:100%; left: 50%;
    transform: translateX(-50%); background: rgba(0, 0, 0, 0.85);
    border: 1px solid ${getSeverityColor(item._group.length)};
    border-radius: 4px; padding: 6px 10px; font-family: monospace;
    font-size: 11px; color: ${getSeverityColor(item._group.length)};
    pointer-events: auto; max-height: 150px; overflow-y: auto; white-space: nowrap; z-index: 9999;
  `;
  tooltip.innerHTML = `<style>::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${dotBgColor}; border-radius: 2px; }</style>`;

  // Append IPs to Tooltip
  item._group.forEach((p: any) => {
    const ipLine = document.createElement("li");
    ipLine.textContent = `${p.ip}`;
    ipLine.className = `p-1 rounded-sm`;
    if (p.ip === targetIp)
      ipLine.style.cssText = `color: ${getSeverityColor(item._group.length, isTarget)}`;

    ipLine.addEventListener("click", () => onIpClick(p.ip));
    ipLine.addEventListener("mouseenter", () => {
      ipLine.style.background =
        p.ip === targetIp
          ? getSeverityColor(item._group.length, isTarget)
          : getSeverityColor(item._group.length);
      ipLine.style.color =
        p.ip === targetIp ? "#ffffff" : getDotTextColor(item._group.length);
    });
    ipLine.addEventListener("mouseleave", () => {
      ipLine.style.background = "";
      ipLine.style.color =
        p.ip === targetIp ? getSeverityColor(item._group.length, isTarget) : "";
    });

    tooltip.appendChild(ipLine);
  });

  // 4. Cluster Badge
  if (item._group.length > 1) {
    const badge = document.createElement("div");
    badge.style.cssText = `
      display: ${item._group.length >= 3 || isTarget ? "flex" : "none"};
      position: absolute; top: 2px; right: 2px;
      background: ${dotBgColor}; color: ${dotColor};
      font-size: 9px; font-family: monospace; border-radius: 50%;
      width: 14px; height: 14px; align-items: center; justify-content: center; pointer-events: none;
    `;
    badge.textContent = String(item._group.length);
    wrapper.appendChild(badge);
  }

  wrapper.appendChild(tooltip);
  wrapper.appendChild(dot);

  wrapper.addEventListener(
    "mouseenter",
    () => (tooltip.style.display = "block"),
  );
  wrapper.addEventListener(
    "mouseleave",
    () => (tooltip.style.display = "none"),
  );

  return wrapper;
};
