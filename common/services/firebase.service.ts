require('ts-node/register');

const firebase = require('firebase');
const path = require('path');
const fs = require('fs');

import { config } from '../config';
const logger = config.logger;

export class FireBase {

  public database: any;

  constructor() {
    // this operation is synchronous
    firebase.initializeApp( config.firebase );

    this.database = firebase.database();
  }
}