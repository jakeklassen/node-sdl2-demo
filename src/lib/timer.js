export class Timer {
  #duration = 0;
  #elapsed = 0;
  #isExpired = false;

  /**
   *
   * @param {number} duration
   */
  constructor(duration) {
    this.#duration = duration;
  }

  get isExpired() {
    return this.#isExpired;
  }

  /**
   *
   * @param {number} dt
   */
  update(dt) {
    this.#elapsed += dt;

    if (this.#elapsed >= this.#duration) {
      this.#isExpired = true;
    }
  }

  reset() {
    this.#elapsed = 0;
    this.#isExpired = false;
  }
}
