import { pantilt } from './config/index.js';
import { NodePanTilt } from './routes/servo.js';

const nodePantilt = new NodePanTilt();

nodePantilt.setPan(0);
nodePantilt.setTilt(0);

const intervalAction = setInterval(() => {
    let motorX = nodePantilt.getPan();
    let motorY = nodePantilt.getTilt();

    if (motorX > 90) { clearInterval(intervalAction); }

    motorX += 10;
    nodePantilt.setPan(motorX);
}, 1000);

/* setInterval(() => {
    console.log(nodePantilt.isPanServoRunning());
}, 300); */

const intervalAction2 = setInterval(() => {
    const isPanRunning = nodePantilt.isTiltServoRunning();
    console.log(isPanRunning);
    /* if (isPanRunning) return;
    let motorX = nodePantilt.getPan();
    let motorY = nodePantilt.getTilt();
    console.log('motorY', motorY);

    if (motorY > 90) { clearInterval(intervalAction2); }

    motorY += 10;
    nodePantilt.setTilt(motorY); */
}, 1000);
