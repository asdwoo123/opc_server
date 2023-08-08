import express from 'express';
import raspberryPiCamera  from 'raspberry-pi-camera-native';

const app = express();

const options = {
    width: 3280,
    height: 2464,
    fps: 15,
    encoding: 'JPEG',
    quality: 75
  }

 raspberryPiCamera.start(options);

 let frame;

 raspberryPiCamera.on('frame', (frameData) => {
    frame = frameData;
});

app.get('/capture', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'image/jpg',
        'Content-length': frame.length,
    });
    res.end(frame);
});

app.listen(3000, () => console.log('서버가 시작되었습니다!'));
