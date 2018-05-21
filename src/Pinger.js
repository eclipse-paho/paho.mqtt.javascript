/**
* Repeat keepalive requests, monitor responses.
* @ignore
*/

import { ERROR, MESSAGE_TYPE, format } from "./definitions";
import WireMessage from "./WireMessage";

function doTimeout(pinger) {
  return function() {
    return pinger.doPing();
  };
}

/**
* Repeat keepalive requests, monitor responses.
* @ignore
*/
export default class {
  constructor(client, self, keepAliveInterval) {
    this._client = client;
    this._self = self;
    this._keepAliveInterval = keepAliveInterval * 1000;
    this.isReset = false;

    this.pingReq = new WireMessage(MESSAGE_TYPE.PINGREQ).encode();

  }

  doPing() {
    if(!this.isReset) {
      this._client._trace("Pinger.doPing", "Timed out");
      this._client._disconnected(ERROR.PING_TIMEOUT.code, format(ERROR.PING_TIMEOUT));
    } else {
      this.isReset = false;
      this._client._trace("Pinger.doPing", "send PINGREQ");
      this._client.socket.send(this.pingReq);
      this.timeout = this._self.setTimeout(doTimeout(this), this._keepAliveInterval);
    }
  }

  reset() {
    this.isReset = true;
    this._self.clearTimeout(this.timeout);
    if(this._keepAliveInterval > 0) {
      this.timeout = setTimeout(doTimeout(this), this._keepAliveInterval);
    }
  }

  cancel() {
    this._self.clearTimeout(this.timeout);
  }
}