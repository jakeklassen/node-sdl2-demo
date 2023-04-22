/**
 * Implementation of the PICO-8 `circfill` function
 * @param {import('canvas').CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string} color
 */
export function circFill(context, x, y, radius, color) {
  let x1 = 0;
  let y1 = radius;
  let diameter = 3 - 2 * radius;

  while (x1 <= y1) {
    // Draw horizontal lines of the circle
    for (let i = -x1; i <= x1; i++) {
      context.fillStyle = color;
      context.fillRect(x + i, y + y1, 1, 1);
      context.fillRect(x + i, y - y1, 1, 1);
    }

    // Draw vertical lines of the circle
    for (let i = -y1; i <= y1; i++) {
      context.fillStyle = color;
      context.fillRect(x + i, y + x1, 1, 1);
      context.fillRect(x + i, y - x1, 1, 1);
    }

    if (diameter < 0) {
      diameter = diameter + 4 * x1 + 6;
    } else {
      diameter = diameter + 4 * (x1 - y1) + 10;
      y1--;
    }

    x1++;
  }
}

/**
 * Implementation of the PICO-8 `circ` function
 * @param {import('canvas').CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string} color
 */
export function circ(context, x, y, radius, color) {
  let x1 = 0;
  let y1 = radius;
  let diameter = 3 - 2 * radius;

  while (x1 <= y1) {
    // Plot points along the circumference of the circle
    context.fillStyle = color;
    context.fillRect(x + x1, y + y1, 1, 1);
    context.fillRect(x - x1, y + y1, 1, 1);
    context.fillRect(x + x1, y - y1, 1, 1);
    context.fillRect(x - x1, y - y1, 1, 1);
    context.fillRect(x + y1, y + x1, 1, 1);
    context.fillRect(x - y1, y + x1, 1, 1);
    context.fillRect(x + y1, y - x1, 1, 1);
    context.fillRect(x - y1, y - x1, 1, 1);

    if (diameter < 0) {
      diameter = diameter + 4 * x1 + 6;
    } else {
      diameter = diameter + 4 * (x1 - y1) + 10;
      y1--;
    }

    x1++;
  }
}

/**
 * Pico-8 palette object
 */
export const Pico8Colors = /** @type {const} */ ({
  Color0: "#000000",
  Color1: "#1d2b53",
  Color2: "#7E2553",
  Color3: "#008751",
  Color4: "#ab5236",
  Color5: "#5F574F",
  Color6: "#c2c3c7",
  Color7: "#fff1e8",
  Color8: "#FF004D",
  Color9: "#FFA300",
  Color10: "#FFEC27",
  Color11: "#00e436",
  Color12: "#29adff",
  Color13: "#83769c",
  Color14: "#ff77a8",
  Color15: "#ffccaa",
});
