import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {

  constructor() {
  }

  public debug(message, ...args) {
    console.debug(message, args);
  }

  public info(message, ...args) {
    console.info(message, args);
  }
}
