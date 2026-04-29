import checkIcon from "lucide-static/icons/check.svg?raw";
import keyIcon from "lucide-static/icons/key-round.svg?raw";
import downloadIcon from "lucide-static/icons/download.svg?raw";
import folderIcon from "lucide-static/icons/folder.svg?raw";
import folderOpenIcon from "lucide-static/icons/folder-open.svg?raw";
import folderSearchIcon from "lucide-static/icons/folder-search.svg?raw";
import listIcon from "lucide-static/icons/list.svg?raw";
import packageIcon from "lucide-static/icons/package.svg?raw";
import playIcon from "lucide-static/icons/play.svg?raw";
import radarIcon from "lucide-static/icons/radar.svg?raw";
import refreshCwIcon from "lucide-static/icons/refresh-cw.svg?raw";
import shieldIcon from "lucide-static/icons/shield.svg?raw";
import trashIcon from "lucide-static/icons/trash-2.svg?raw";

const icons: Record<string, string> = {
  check: checkIcon,
  download: downloadIcon,
  key: keyIcon,
  folder: folderIcon,
  "folder-open": folderOpenIcon,
  "folder-search": folderSearchIcon,
  list: listIcon,
  package: packageIcon,
  play: playIcon,
  radar: radarIcon,
  "refresh-cw": refreshCwIcon,
  shield: shieldIcon,
  trash: trashIcon
};

export function icon(name: string): string {
  return icons[name] ?? "";
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
