class Particle {
  constructor(velocity) {
    this.x = random(-(width / 2), width / 2);
    this.y = 0;
    this.radius = map(velocity, 0, 1, width / 15, width / 5);

    // pre-determined
    this.color = Particle.createColor();
    this.maxLifeSpan = frameRate() * 2;
    this.lifeSpan = this.maxLifeSpan;
    this.isVisible = true;
  }

  static createColor() {
    const r = random(random(0, 80), 255);
    const g = random(random(0, 80), 255);
    const b = random(random(0, 80), 255);
    return color(r, g, b);
  }

  update() {
    if (this.lifeSpan < 0) {
      this.isVisible = false;
    }

    this.lifeSpan--;
    this.y += this.radius * .1;
  }

  draw() {
    push();
    translate(width / 2, 0);
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.radius * (this.lifeSpan / this.maxLifeSpan));
    pop();
  }
}