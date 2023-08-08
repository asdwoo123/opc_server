import express from "express";
import localtunnel from "localtunnel";
import SocketIO from "socket.io";
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from "body-parser";
import {
  db
} from "./config/index.js";
import { opcEvent } from './utils/event.js';
import { logger } from './utils/logger.js';
import { opcConnect, opcDisconnect, testOPCConnect } from './opc.js';
import CameraRouter from './routes/cameraRouter.js';
import PantiltRouter from './routes/pantiltRouter.js';
import RemoteRouter from './routes/remoteRouter.js';
import DataRouter from './routes/dataRouter.js';
import SettingRouter from './routes/settingRouter.js';

const {
  headOffice,
  branchOffice,
  projectName,
  stationName,
  uuid,
  port,
  host,
  nodeInfo,
  camera,
  pantilt,
  remote
} = db.data;

testOPCConnect();
// opcConnect();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use('/camera', CameraRouter);
app.use('/pantilt', PantiltRouter);
app.use('/remote', RemoteRouter);
app.use('/data', DataRouter);
app.use('/setting', SettingRouter);

const domain = `${headOffice}.${branchOffice}.${projectName}.${stationName}.${uuid}`;

function connectTunnel() {
  localtunnel({ port, subdomain: domain, host }, (err, tunnel) => {
    if (err) {
      setTimeout(connectTunnel, 3000);
    } else {
      logger.info(`${host}와 localtunnel이 연결되었습니다.`);  

      tunnel.on("dead", () => {
        setTimeout(connectTunnel, 3000);
      });

      tunnel.on("close", () => {
        console.log('close');
        setTimeout(connectTunnel, 3000);
      });
      tunnel.on("error", () => {
        console.log('error');
        setTimeout(connectTunnel, 3000);
      });
    }
  });
}

const server = app.listen(port, () => {
    logger.info(`${port}번 포트에서 서버가 시작되었습니다.`);
    connectTunnel();
});

const io = SocketIO(server, { path: `/socket.io` });

const data = {}

/* setInterval(() => {
  const memoryData = process.memoryUsage();
  const memoryUsage = {
    rss: `${memoryData.rss / 1024 / 1024} MB`,
    heapTotal: `${memoryData.heapTotal / 1024 / 1024} MB`,
    heapUsed: `${memoryData.heapUsed / 1024 / 1024} MB`,
    external: `${memoryData.external / 1024 / 1024} MB`,
  };
  console.log(memoryUsage);
}, 500); */

nodeInfo.forEach((node) => {
    data[node['name']] = '';
});

io.on('connection', (socket) => {
    logger.info('소켓이 연결되었습니다.');

    socket.emit('init', {
        isCamera: camera.active,
        isPantilt: pantilt.active,
        isRemote: remote.active,
        data: {
          message: '',
          ...data,
          detect_rate: '0'
        }
    });

    const dataHandler = ({ name, value }) => {
        data[name] = value;
        socket.emit('data', {
            name, value
        });
    }

    opcEvent.on('data', dataHandler);

    socket.on('disconnect', () => {
        logger.info('소켓 연결이 해제되었습니다.');
        opcEvent.removeListener('data', dataHandler);
    });
});

