/* @flow */

import Gun from 'gun/gun';
import { async } from 'most-subject';

Gun.chain.most = function most(options) {
  const subject = async();
  this.on(data => subject.next(data), options);
  return subject;
};
