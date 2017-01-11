/* @flow */
/* eslint-disable import/prefer-default-export */

import Gun from 'gun/gun';
import { async } from 'most-subject';

Gun.chain.most = function most({ completeToken, options } = {}) {
  const subject = async();
  this.on(data => subject.next(data), options);
  if (completeToken) {
    completeToken.listen.observe(() => undefined).then(() =>
      subject.complete(),
    );
  }
  return subject;
};

const CompleteToken = () => {
  const subject = async();
  return {
    listen: subject,
    complete: () => subject.complete(),
  };
};

export {
  CompleteToken,
};
