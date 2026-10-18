import { staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
loadFont({
  family: "Noto Bengali",
  url: staticFile("fonts/NotoSansBengali.ttf"),
  weight: "100 900",
});
export const colors = {
  // Deep forest & nature palette
  deepForest: "#0A1F14",
  charcoal: "#1A2A22",
  forestGreen: "#1B4332",
  emerald: "#2D6A4F",
  leafGreen: "#40916C",
  lightLeaf: "#52B788",
  sage: "#74C69D",
  mint: "#95D5B2",
  paleGreen: "#B7E4C7",
  cream: "#D8F3DC",
  // Accent & highlight
  sunlight: "#FFD166",
  warmGold: "#F4A261",
  signal: "#06D6A0",
  glow: "#00F5D4",
  coral: "#EF476F",
  // Text
  paper: "#F0F7F4",
  textDark: "#0B1D13",
  textMid: "#2D4A3E",
  textLight: "#6B8F7F",
  // Science UI
  cellWall: "#3A7D5C",
  water: "#48BFE3",
  ion: "#7B2D8E",
};
export const font = '"Noto Bengali", sans-serif';
