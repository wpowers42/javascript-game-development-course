import Bird from "./Bird.js";
import Graphics from "./Graphics.js";
import PipePair from "./PipePair.js";
import Mathf from "../math/Mathf.js";

export default class Game {
    ctx: CanvasRenderingContext2D;
    input: InputHandler;
    graphics: Graphics;
    fps: number;
    t: number;
    dt: number;
    accumulator: number;
    width: number;
    height: number;
    bird: Bird;
    lastTime: number;
    pipePairs: PipePair[];
    pipePairY: number;
    pipePairSpawnInterval: number;
    pipePairSpawnTimer: number;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.input = new InputHandler();
        this.graphics = new Graphics(this);
        this.bird = new Bird(this);
        this.fps = 60;
        this.t = 0;
        this.dt = 1000 / this.fps;
        this.accumulator = 0;
        this.lastTime = performance.now();
        this.pipePairs = [];
        this.pipePairY = this.height * 0.5;
        this.pipePairSpawnInterval = 2500;
        this.pipePairSpawnTimer = 0;
    }

    step(dt: number) {
        this.pipePairSpawnTimer += dt;
        if (this.pipePairSpawnTimer > this.pipePairSpawnInterval) {
            this.pipePairY = Mathf.Clamp(this.pipePairY + Math.random() * 40 - 20,
                this.height * 0.25, this.height * 0.75);
            this.pipePairs.push(new PipePair(this, this.pipePairY));
            this.pipePairs = this.pipePairs.filter(pipePair => !pipePair.markedForDeletion);
            this.pipePairSpawnTimer -= this.pipePairSpawnInterval;
        }

        this.graphics.update(dt);
        this.bird.update(dt);
        this.pipePairs.forEach(pipePair => pipePair.update(dt));
        this.input.reset();

    }


    update() {
        let newTime = performance.now();
        let frameTime = newTime - this.lastTime;
        this.lastTime = newTime;
        this.accumulator += frameTime;

        while (this.dt < this.accumulator) {
            this.step(this.dt);
            this.t += this.dt;
            this.accumulator -= this.dt;
        }
    }

    draw() {
        this.graphics.drawBackground(this.ctx);
        this.pipePairs.forEach(pipePair => pipePair.draw(this.ctx));
        this.graphics.drawGround(this.ctx);
        this.bird.draw(this.ctx);
    }
}

class InputHandler {
    private keyPressed: { [key: string]: boolean };

    constructor() {
        this.keyPressed = {};

        document.addEventListener('keypress', e => {
            if (e.repeat) {
                // ignore repeat key presses
                return;
            }

            this.keyPressed[e.key] = true;
        });

        document.addEventListener('keyup', e => {
            this.keyPressed[e.key] = false;
        });
    }

    isKeyPressed(key: string): boolean {
        return this.keyPressed[key];
    }

    reset(): void {
        this.keyPressed = {};
    }

}
