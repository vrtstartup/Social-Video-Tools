require('ts-node/register');

const firebase:any = require('firebase');
const path = require('path');
const fs = require('fs');

import { config } from '../config';
const logger = config.logger;

firebase.initializeApp( config.firebase );

export const db = firebase.database();