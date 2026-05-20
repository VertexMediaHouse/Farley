/**
 * Calculates the ceiling area based on room length and width.
 * Formula: Area = Length * Width
 */
export function calculateCeilingArea(length: number, width: number): number {
  return length * width;
}

/**
 * Calculates the total wall surface area of a rectangular room.
 * Formula: Area = 2 * (Length * Height) + 2 * (Width * Height)
 */
export function calculateWallArea(length: number, width: number, height: number): number {
  return 2 * (length * height) + 2 * (width * height);
}

/**
 * Calculates the perimeter of the room floor.
 * Useful for linear baseboard and crown molding installation.
 * Formula: Perimeter = 2 * (Length + Width)
 */
export function calculatePerimeter(length: number, width: number): number {
  return 2 * (length + width);
}

/**
 * Appends a waste percentage to a base quantity.
 * Example: 100 sqft with 10% waste = 110 sqft
 */
export function addWaste(quantity: number, wastePercent: number): number {
  return quantity * (1 + wastePercent);
}

/**
 * Rounds any number up to the nearest integer.
 * Crucial for purchasing materials (sheets, rolls, compound buckets, etc.).
 */
export function roundUpToNearestInteger(value: number): number {
  return Math.ceil(value);
}
