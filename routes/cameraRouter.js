import express from 'express';
import { db } from '../config/index.js';
import { cameraEvent } from '../utils/event.js';

const { camera } = db.data;

const router = express.Router();

if (camera.active) {
    const { default: raspberryPiCamera } = await import('raspberry-pi-camera-native');

    let frame;
    raspberryPiCamera.start(camera);
    raspberryPiCamera.setMaxListeners(1000);

    raspberryPiCamera.on('frame', (frameData) => {
        frame = frameData;
        cameraEvent.emit('frame', frameData);
    });

    router.get('/stream', (req, res) => {
        console.log('stream');
        res.writeHead(200, {
            'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
            Pragma: 'no-cache',
            Connection: 'close',
            'Content-Type': 'multipart/x-mixed-replace; boundary=--frame'
        });

        const writeFrame = (frameData) => {
            res.write('--frame\nContent-Type: image/jpg\nContent-length: ${frameData.length}\n\n');
            res.write(frameData);
        };

        cameraEvent.on('frame', writeFrame);

        req.on('close', () => {
            cameraEvent.removeListener('frame', writeFrame);
        });
    });

    router.get('/capture', (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'image/jpg',
            'Content-length': frame.length,
        });
        res.end(frame);
    });
}

export default router;

