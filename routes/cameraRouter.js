import express, { application } from 'express';
import { camera } from '../config/index.js';

const router = express.Router();

if (camera.active) {
    const { default: raspberryPiCamera } = await import('raspberry-pi-camera-native');

    raspberryPiCamera.start(camera);
    raspberryPiCamera.setMaxListeners(1000);
    let frame;

    router.get('/stream', (req, res) => {
        console.log('stream');
        res.writeHead(200, {
            'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
            Pragma: 'no-cache',
            Connection: 'close',
            'Content-Type': 'multipart/x-mixed-replace; boundary=--frame'
        });

        const writeFrame = (frameData) => {
            frame = frameData;
            res.write('--frame\nContent-Type: image/jpg\nContent-length: ${frameData.length}\n\n');
            res.write(frameData);
        };

        raspberryPiCamera.on('frame', writeFrame);

        req.on('close', () => {
            raspberryPiCamera.removeListener('frame', writeFrame);
        });
    });

    router.get('/frame', (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'image/jpg',
            'Content-length': frame.length
        });
        res.end(frame);
    });
}

export default router;

