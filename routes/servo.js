import i2c from 'i2c-bus';

const BUS_NUMBER = 0x01;
const ADDR = 0x15;
const CONFIG = 0x00;
const REG_PAN_SERVO = 0x01;
const REG_TILT_SERVO = 0x03;
export const SERVO_MIN = 575;
export const SERVO_MAX = 2325;
const IDLE_TIME = 2000; // ms

export class NodePanTilt {
  constructor() {
    this.i2c = i2c.openSync(BUS_NUMBER);
    this.servoPanState = false;
    this.servoTiltState = false;
  }

  getPan() {
    this.enablePanServo();
    const pan = this.toDegrees(this.i2c.readWordSync(ADDR, REG_PAN_SERVO));
    this.disablePanServo();
    return pan;
  }

  getTilt() {
    this.enableTiltServo();
    const tilt = this.toDegrees(this.i2c.readWordSync(ADDR, REG_TILT_SERVO));
    this.disableTiltServo();
    return tilt;
  }

  setPan(angle) {
    this.enablePanServo();
    this.i2c.writeWord(
      ADDR,
      REG_PAN_SERVO,
      this.toServoDegrees(angle),
      () => this.disablePanServo()
    );
  }

  setTilt(angle) {
    this.enableTiltServo();
    this.i2c.writeWord(
      ADDR,
      REG_TILT_SERVO,
      this.toServoDegrees(angle),
      () => this.disableTiltServo()
    );
  }

  enablePanServo() {
    if (!this.servoPanState) {
      this.servoPanState = true;
      this.putConfig();
    }
  }

  enableTiltServo() {
    if (!this.servoTiltState) {
      this.servoTiltState = true;
      this.putConfig();
    }
  }

  disablePanServo() {
    this.timerPanServo = this.clearTimer(this.timerPanServo);
    this.timerPanServo = setTimeout(() => {
      this.servoPanState = false;
      this.putConfig();
    }, IDLE_TIME);
  }

  disableTiltServo() {
    this.timerTiltServo = this.clearTimer(this.timerTiltServo);
    this.timerTiltServo = setTimeout(() => {
      this.servoTiltState = false;
      this.putConfig();
    }, IDLE_TIME);
  }

  clearTimer(timer) {
    if (timer) clearTimeout(timer);
    return null;
  }

  putConfig(config = this.setUpConfig()) {
    this.i2c.writeByteSync(ADDR, CONFIG, config);
  }

  setUpConfig() {
    let config = 0;
    config |= Number(this.servoPanState) << 0;
    config |= Number(this.servoTiltState) << 1;
    return config;
  }

  toServoDegrees(degrees) {
    return SERVO_MIN + Math.ceil(((SERVO_MAX - SERVO_MIN) / 180) * (degrees + 90));
  }

  toDegrees(servoDegrees) {
    return Math.round(((servoDegrees - SERVO_MIN) / (SERVO_MAX - SERVO_MIN)) * 180.0) - 90;
  }
}
