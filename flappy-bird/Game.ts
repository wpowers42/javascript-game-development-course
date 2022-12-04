import Bird from "./Bird.js";
import Graphics from "./Graphics.js";
import StateMachine from "./StateMachine.js";
import TitleScreenState from "./states/TitleScreenState.js";
import PlayState from "./states/PlayState.js";
import ScoreState from "./states/ScoreState.js";
import CountdownState from "./states/CountdownState.js";

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
    lastTime: number;
    paused: boolean;
    debug: boolean;
    stateMachine: StateMachine;
    fonts: { [key: string]: string }

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.input = new InputHandler();
        this.fonts = {
            'small': '16px flappy',
            'medium': '24px flappy',
            'large': '48px flappy',
        }
        this.graphics = new Graphics(this);
        this.stateMachine = new StateMachine({
            'title': () => new TitleScreenState(this),
            'play': () => new PlayState(this),
            'score': () => new ScoreState(this),
            'countdown': () => new CountdownState(this),
        });
        this.stateMachine.change('title');
        this.paused = false;
        this.debug = true;
        this.fps = 60;
        this.t = 0;
        this.dt = 1000 / this.fps;
        this.accumulator = 0;
        this.lastTime = performance.now();
    }

    step(dt: number) {
        this.stateMachine.update(dt);
        this.graphics.update(dt);
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
        this.stateMachine.draw(this.ctx);
        this.graphics.drawGround(this.ctx);
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
