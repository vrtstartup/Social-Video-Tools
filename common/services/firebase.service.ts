require('ts-node/register');

const firebase = require('firebase');
const path = require('path');
const fs = require('fs');

import { fbConfig } from '../config/firebase';
import { logger } from '../../common/config/winston';

export class FireBase {

  public database: any;

  constructor() {
    // this operation is synchronous
    firebase.initializeApp( fbConfig );

    this.database = firebase.database();
  }
}