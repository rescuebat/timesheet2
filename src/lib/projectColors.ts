
// Generate consistent, unique colors for projects
export const generateProjectColor = (projectName: string): string => {
  // Create a simple hash from the project name
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    const char = projectName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Get existing project colors from localStorage to avoid duplicates
  const existingColors = getExistingProjectColors();
  
  // Extended set of beautiful, matte, bright-yet-soft solid colors
  const softColors = [
    '#FFB4A2', // Soft coral
    '#B5EAD7', // Mint
    '#A0C4FF', // Baby blue
    '#FFD6A5', // Peach
    '#BDB2FF', // Lavender
    '#FDFFB6', // Light yellow
    '#FFADAD', // Light red
    '#CAFFBF', // Light green
    '#9BF6FF', // Sky blue
    '#FFC6FF', // Pink
    '#D0F4DE', // Pale green
    '#FFF1E6', // Cream
    '#F1C0E8', // Orchid
    '#FDE2E4', // Blush
    '#CDEAC0', // Pale mint
    '#FFF5BA', // Light gold
    '#B5D0FF', // Soft blue
    '#E2F0CB', // Light lime
    '#F6DFEB', // Pale pink
    '#E4C1F9', // Soft purple
  ];
  
  // Check if this project already has a color assigned
  const existingColor = existingColors[projectName];
  if (existingColor) {
    return existingColor;
  }
  
  // Find an unused color
  const usedColors = Object.values(existingColors);
  const availableColors = softColors.filter(color => !usedColors.includes(color));
  
  let selectedColor;
  if (availableColors.length > 0) {
    // Use hash to select from available colors
    const index = Math.abs(hash) % availableColors.length;
    selectedColor = availableColors[index];
  } else {
    // If all colors are used, fall back to hash-based selection
    const index = Math.abs(hash) % softColors.length;
    selectedColor = softColors[index];
  }
  
  // Store the color assignment
  const updatedColors = { ...existingColors, [projectName]: selectedColor };
  localStorage.setItem('project-colors', JSON.stringify(updatedColors));
  
  return selectedColor;
};

const getExistingProjectColors = (): Record<string, string> => {
  const saved = localStorage.getItem('project-colors');
  return saved ? JSON.parse(saved) : {};
};

export const isColorCodedProjectsEnabled = (): boolean => {
  const saved = localStorage.getItem('color-coded-projects-enabled');
  return saved ? JSON.parse(saved) : false;
};

// Utility to darken a hex color by a percentage
export function darkenHexColor(hex: string, percent: number = 20): string {
  // Remove # if present
  hex = hex.replace('#', '');
  // Parse r, g, b
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  // Decrease each by percent
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));
  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
