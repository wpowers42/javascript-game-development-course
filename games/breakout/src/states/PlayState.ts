import Ball from "../Ball.js";
import { Constants } from "../constants.js";
import InputHandler from "../InputHandler.js";
import Paddle from "../Paddle.js";
import BaseState from "./BaseState.js";

import Brick from "../Brick";
import StateMachine from "../StateMachine";
import { Mathf } from "../../../math/Mathf.js";
import { Util } from "../Util.js";

export default class PlayState extends BaseState {
    paddle: Paddle;
    paused: boolean;
    ball: Ball;
    bricks: Brick[];
    health: number;
    score: number;

    constructor() {
        super();
        this.paused = false;
    }

    enter(params?: Object) {
        this.paddle = params['paddle'];
        this.bricks = params['bricks'];
        this.health = params['health'];
        this.score = params['score'];
        this.ball = params['ball'];
    }


    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) {
        if (inputHandler.isKeyPressed(' ')) {
            // Toggle the paused state of the game
            this.paused = !this.paused;

            // Play the pause sound
            Constants.sounds.pause.play();

            // Remove the space key from the input queue
            inputHandler.removeKey(' ');
        }

        this.paddle.update(dt, inputHandler);
        this.ball.update(dt);

        if (this.ball.collides(this.paddle)) {
            // check if ball hit left or right side
            let previousBallX = this.ball.x - this.ball.dx * dt;

            if (this.ball.x + this.ball.width >= this.paddle.x &&
                previousBallX + this.ball.width < this.paddle.x) {
                // ball hit left side of paddle
                this.ball.dx = -this.ball.dx;
            } else if (this.ball.x <= this.paddle.x + this.paddle.width &&
                previousBallX > this.paddle.x + this.paddle.width) {
                // ball hit right side of paddle
                this.ball.dx = -this.ball.dx;
            } else {
                // ball hit top or bottom of paddle
                this.ball.dy = -this.ball.dy;
                this.ball.y = this.paddle.y - this.ball.height;
            }

            Constants.sounds.paddleHit.play();


            let ballCenterX = this.ball.x + this.ball.width * 0.50;
            let paddleCenterX = this.paddle.x + this.paddle.width * 0.50;
            let horizontalVelocityRatio = Mathf.Clamp((ballCenterX - paddleCenterX) / (this.paddle.width * 0.50), -1, 1);

            if (this.paddle.dx !== 0) {
                // ball hit paddle on while moving
                this.ball.dx = horizontalVelocityRatio * this.ball.maxHorizontalSpeed;
            }
        }

        // TODO: reset ball position to edge of brick if the ball is getting stuck
        for (const brick of this.bricks) {
            brick.update(dt);

            if (brick.inPlay && this.ball.collides(brick)) {
                this.score += brick.tier * 200 + brick.color * 25;
                
                brick.hit();

                let previousBallX = this.ball.x - this.ball.dx * dt;

                if (this.ball.x + this.ball.width >= brick.x &&
                    previousBallX + this.ball.width < brick.x) {
                    // ball hit left side of brick
                    this.ball.dx = -this.ball.dx;
                } else if (this.ball.x <= brick.x + brick.width &&
                    previousBallX > brick.x + brick.width) {
                    // ball hit right side of brick
                    this.ball.dx = -this.ball.dx;
                } else {
                    // ball hit top or bottom of brick
                    this.ball.dy = -this.ball.dy;
                }

                /*
                To prevent multiple velocity changes, we exit the loop after the
                first collision is handled. This also ensures that only one brick
                is destroyed. Instead of breaking the loop, we can use a boolean
                flag to prevent future velocity changes and still check for
                collisions with other bricks
                */
                break;
            }
        }

        if (this.ball.y >= Constants.virtualHeight) {
            this.health--;
            Constants.sounds.hurt.play();

            if (this.health === 0) {
                stateMachine.change('gameOver', {
                    score: this.score
                });
            } else {
                stateMachine.change('serve', {
                    paddle: this.paddle,
                    bricks: this.bricks,
                    health: this.health,
                    score: this.score,
                });
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.bricks.forEach(brick => brick.draw(ctx));

        this.paddle.draw(ctx);
        this.ball.draw(ctx);

        Util.drawScore(ctx, this.score);
        Util.drawHealth(ctx, this.health);

        if (this.paused) {
            ctx.font = Constants.fonts.large;
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50 - 16);
        }
    }
}
