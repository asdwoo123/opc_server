import express from 'express';
import { db } from '../config/index.js';

const router = express.Router();

const { pantilt } = db.data;

if (pantilt.active) {
    const { NodePanTilt } = await import('./servo.js');
    const nodePantilt = new NodePanTilt();
    nodePantilt.setTilt(0);
    nodePantilt.setPan(0);

    router.post('/pantilt', (req, res) => {
        const isRunning = nodePantilt.isServoRunning();
        if (isRunning) return;
        
        const { action } = req.body;
        
        let intervalAction;
        let motorX = nodePantilt.getPan();
        let motorY = nodePantilt.getTilt();

        if (action === 'left') {

            intervalAction = setInterval(() => {
                motorX += pantilt.length;
                nodePantilt.setPan(motorX);

                if (motorX > 90) { clearInterval(intervalAction); }
            }, pantilt.speed);

        } else if (action === 'right') {
            intervalAction = setInterval(() => {
                motorX -= pantilt.length;
                nodePantilt.setPan(motorX);

                if (-90 > motorX) { clearInterval(intervalAction); }
            }, pantilt.speed);
        } else if (action === 'top') {
            intervalAction = setInterval(() => {
                motorY -= pantilt.length;
                nodePantilt.setTilt(motorY);

                if (90 < motorY) { clearInterval(intervalAction); }
            }, pantilt.speed);
        } else if (action === 'bottom') {
            intervalAction = setInterval(() => {
                motorY += pantilt.length;
                nodePantilt.setTilt(motorY);

                if (-90 > motorY) { clearInterval(intervalAction); }
            }, pantilt.speed);
        } else if (action === 'stop') {
            if (intervalAction !== undefined) {
                clearInterval(intervalAction)
            }
        };
    });
}

export default router;

