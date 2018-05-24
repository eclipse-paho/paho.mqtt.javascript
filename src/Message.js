import { ERROR, UTF8Length, format, parseUTF8, stringToUTF8 } from "./definitions";

/**
* An application message, sent or received.
* <p>
* All attributes may be null, which implies the default values.
*
* @name Message
* @constructor
* @param {String|ArrayBuffer} payload The message data to be sent.
* <p>
* @property {string} payloadString <i>read only</i> The payload as a string if the payload consists of valid UTF-8 characters.
* @property {ArrayBuffer} payloadBytes <i>read only</i> The payload as an ArrayBuffer.
* <p>
* @property {string} destinationName <b>mandatory</b> The name of the destination to which the message is to be sent
*                    (for messages about to be sent) or the name of the destination from which the message has been received.
*                    (for messages received by the onMessage function).
* <p>
* @property {number} qos The Quality of Service used to deliver the message.
* <dl>
*     <dt>0 Best effort (default).
*     <dt>1 At least once.
*     <dt>2 Exactly once.
* </dl>
* <p>
* @property {Boolean} retained If true, the message is to be retained by the server and delivered
*                     to both current and future subscriptions.
*                     If false the server only delivers the message to current subscribers, this is the default for new Messages.
*                     A received message has the retained boolean set to true if the message was published
*                     with the retained boolean set to true
*                     and the subscrption was made after the message has been published.
* <p>
* @property {Boolean} duplicate <i>read only</i> If true, this message might be a duplicate of one which has already been received.
*                     This is only set on messages received from the server.
*
*/
export default class {
  constructor(newPayload) {
    let payload;
    if(typeof newPayload === "string" ||
        newPayload instanceof ArrayBuffer ||
          (ArrayBuffer.isView(newPayload) && !(newPayload instanceof DataView))
    ) {
      payload = newPayload;
    } else {
      throw (format(ERROR.INVALID_ARGUMENT, [newPayload, "newPayload"]));
    }

    let destinationName;
    let qos = 0;
    let retained = false;
    let duplicate = false;

    Object.defineProperties(this, {
      payloadString: {
        enumerable: true,
        get:        function() {
          if(typeof payload === "string") {
            return payload;
          } else {
            return parseUTF8(payload, 0, payload.length);
          }
        }
      },
      payloadBytes: {
        enumerable: true,
        get:        function() {
          if(typeof payload === "string") {
            const buffer = new ArrayBuffer(UTF8Length(payload));
            const byteStream = new Uint8Array(buffer);
            stringToUTF8(payload, byteStream, 0);

            return byteStream;
          } else {
            return payload;
          }
        }
      },
      destinationName: {
        enumerable: true,
        get:        function() {
          return destinationName;
        },
        set: function(newDestinationName) {
          if(typeof newDestinationName === "string") {
            destinationName = newDestinationName;
          } else {
            throw new Error(format(ERROR.INVALID_ARGUMENT, [newDestinationName, "newDestinationName"]));
          }
        }
      },
      qos: {
        enumerable: true,
        get:        function() {
          return qos;
        },
        set: function(newQos) {
          if(newQos === 0 || newQos === 1 || newQos === 2) {
            qos = newQos;
          } else {
            throw new Error("Invalid argument:" + newQos);
          }
        }
      },
      retained: {
        enumerable: true,
        get:        function() {
          return retained;
        },
        set: function(newRetained) {
          if(typeof newRetained === "boolean") {
            retained = newRetained;
          } else {
            throw new Error(format(ERROR.INVALID_ARGUMENT, [newRetained, "newRetained"]));
          }
        }
      },
      topic: {
        enumerable: true,
        get:        function() {
          return destinationName;
        },
        set: function(newTopic) {
          destinationName = newTopic;
        }
      },
      duplicate: {
        enumerable: true,
        get:        function() {
          return duplicate;
        },
        set: function(newDuplicate) {
          duplicate = newDuplicate;
        }
      }
    });
  }
}
