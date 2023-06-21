import express from 'express';
import { pantilt } from '../config/index.js';

const router = express.Router();

if (pantilt.active) {
    const { default: NodePanTilt } = await import('./servo.js');
    const nodePantilt = new NodePanTilt();
    nodePantilt.setTilt(0);
    nodePantilt.setPan(0);

    let intervalAction;
    let inAction;

    router.post('/pantilt', (req, res) => {
        const { action } = req.body;
        
        let motorX = pantilt.getPan();
        let motorY = pantilt.getTilt();

        if (action === 'left') {

            intervalAction = setInterval(() => {
                motorX += config.pantilt.length;
                pantilt.setPan(motorX);

                if (motorX > 90) { clearInterval(intervalAction); }
            }, config.pantilt.speed);

        } else if (action === 'right') {
            intervalAction = setInterval(() => {
                motorX -= config.pantilt.length;
                pantilt.setPan(motorX);

                if (-90 > motorX) { clearInterval(intervalAction); }
            }, config.pantilt.speed);
        } else if (action === 'top') {
            intervalAction = setInterval(() => {
                motorY -= config.pantilt.length;
                pantilt.setTilt(motorY);

                if (90 < motorY) { clearInterval(intervalAction); }
            }, config.pantilt.speed);
        } else if (action === 'bottom') {
            intervalAction = setInterval(() => {
                motorY += config.pantilt.length;
                pantilt.setTilt(motorY);

                if (-90 > motorY) { clearInterval(intervalAction); }
            }, config.pantilt.speed);
        } else if (action === 'stop') {
            if (intervalAction !== undefined) {
                clearInterval(intervalAction)
            }
        };
    });
}

export default router;

