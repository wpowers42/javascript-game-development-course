import BaseState from "./BaseState.js";
import { Constants } from "../constants.js";
export default class GameOverState extends BaseState {
    constructor() {
        super();
    }
    enter(params) {
        this.score = params['score'];
    }
    update(dt, inputHandler, stateMachine) {
        if (inputHandler.isKeyPressed('Enter')) {
            stateMachine.change('start');
        }
        if (inputHandler.isKeyPressed('Enter')) {
            // handle quit
        }
    }
    draw(ctx) {
        ctx.font = Constants.fonts.large;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.33);
        ctx.font = Constants.fonts.medium;
        ctx.fillText(`Final Score: ${this.score}`, Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50);
        ctx.fillText('Press Enter', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.75);
    }
}
//# sourceMappingURL=GameOverState.js.map