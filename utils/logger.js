import { createLogger, format, transports } from 'winston';

const koreanTime = () => new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Seoul',
});

export const logger = createLogger({
    level: 'info',
    format: format.combine(format.json(), format.timestamp(
      { format: koreanTime }
    )),
    transports: [
      new transports.File({ filename: 'combined.log',
      format: format.combine(format.timestamp(
        { format: koreanTime },
      ), format.json())
     }),
      new transports.File({ filename: 'error.log', level: 'error' }),
    ],
  });
  
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({ format: format.simple() }));
  }
  