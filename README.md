# Rocket.Chat.RealTime.API.RxJS

[![npm](https://img.shields.io/npm/v/rocket.chat.realtime.api.rxjs.svg)](https://www.npmjs.com/package/@lucabuening/rocket.chat.realtime.api.rxjs)

Abstraction for Utilizing [Rocket.Chat](https://rocket.chat/)'s [Realtime API](https://rocket.chat/docs/developer-guides/realtime-api) Methods with [RxJS v7](http://reactivex.io/rxjs/). Forked by Luca Büning.

## Installation

```
npm install --save @lucabuening/rocket.chat.realtime.api.rxjs
```

For RxJS v5 Version of the Package

```
npm install --save rocket.chat.realtime.api.rxjs@1.0.0
```

## Usage

```

import { RealTimeAPI } from "lucabuening@/rocket.chat.realtime.api.rxjs";

const realTimeAPI =  new RealTimeAPI("wss://demo.rocket.chat/websocket");
// Provide, URL to the Rocket.Chat's Realtime API.

realTimeAPI.keepAlive().subscribe();
// Responds "pong" to the "ping" message sent by the Realtime API. To keep the connection alive.

const auth = realTimeAPI.login(USERNAME, PASSWORD);
// Creating Observable

//Now subscribing the observable

    auth.subscribe(
    (data) => console.log(data),
    (err) => console.log(err),
    () => console.log('completed'));
...
...

// Use any of the methods implmented in the package.

```

## Methods

| Methods                                                    | Functionality                                                                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| connectToServer()                                          | Initiates Connections to the Server to the RealTime API. Returns Observable with the server's response                              |
| keepAlive()                                                | Returns Observable to subscribe which Responds "pong" to the "ping" message sent by the Realtime API. To keep the connection alive. |
| login(username, password)                                  | Returns Observable to the Result/Response from the RealTime API.                                                                    |
| loginWithAuthToken(authToken)                              | Returns Observable to the Result/Response from the RealTime API.                                                                    |
| loginWithOAuth(credToken, credSecret)                      | Returns Observable to the Result/Response from the RealTime API.                                                                    |
| callMethod(methodName, ...params)                          | Returns Observable to the Result of Method Call from Rocket.Chat Realtime API                                                       |
| sendMessage(jsonObject)                                    | Sends the JSON Object to the API Server                                                                                             |
| onMessage( message => console.log(message) )               | Subscribes to the Messages sent from the server                                                                                     |
| onError( error => console.error(error) )                   | Subscribes to the Errors.                                                                                                           |
| onCompletion(() => console.info("Complete"))               | Subscribes to Completion on the Websocket Connection                                                                                |
| subscribe(messageHandler, errorHandler, completionHandler) | Subscribes to All three i.e - messages, errors and completion                                                                       |
| getObservable()                                            | Returns observable of the WebSocket Connection to the RealTime API                                                                  |
| disconnect()                                               | Disconnect the WebSocket Connection between client and RealTime API                                                                 |
|                                                            |                                                                                                                                     |

### Checkout the Rocket.Chat's [RealTime API documentation](https://rocket.chat/docs/developer-guides/realtime-api) for further information on working of the RealTime API.
