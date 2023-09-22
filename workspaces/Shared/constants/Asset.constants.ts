export const BACKGROUND = [
  "Classic",
  "Earth",
  "Football",
  "Island",
  "Rugby",
  "Tennis",
  "Winter",
  "Random",
];

export const BALL = [
  "Classic",
  "Basket",
  "Bowling1",
  "Bowling2",
  "Bowling3",
  "Rugby",
  "Football1",
  "Football2",
  "Football3",
  "Football4",
  "Volley1",
  "Volley2",
  "Random",
];

type PlayerColor = {
  name: string;
  color: string;
};

export const PLAYER_COLOR: PlayerColor[] = [
  { name: "paprika", color: "#f44336" },
  { name: "fuschia", color: "#e91e63" },
  { name: "mauve", color: "#9c27b0" },
  { name: "violet", color: "#673ab7" },
  { name: "navyBlue", color: "#3f51b5" },
  { name: "blue", color: "#2196f3" },
  // line 2
  { name: "skyBlue", color: "#03a9f4" },
  { name: "turquoise", color: "#00bcd4" },
  { name: "emerald", color: "#009688" },
  { name: "grassGreen", color: "#4caf50" },
  { name: "appleGreen", color: "#8bc34a" },
  { name: "limeGreen", color: "#cddc39" },
  //line 3
  { name: "canaryYellow", color: "#ffeb3b" },
  { name: "yellow", color: "#ffc107" },
  { name: "mustardYellow", color: "#ff9800" },
  { name: "tangerine", color: "#ff5722" },
  { name: "nightblue", color: "#023047" },
  { name: "gray", color: "#607d8b" },
];

export const COLOR_MENU = { r: 0, g: 0, b: 0, a: 0.5 };
export const COLOR_FONT = { r: 255, g: 255, b: 255, a: 1 }; // white
export const COLOR_FONT_DARK = { r: 0, g: 0, b: 0, a: 1 }; // black
export const COLOR_ROUND_WON = { r: 0, g: 170, b: 40, a: 1 };
export const COLOR_PAUSE = { r: 255, g: 0, b: 0, a: 1 };
