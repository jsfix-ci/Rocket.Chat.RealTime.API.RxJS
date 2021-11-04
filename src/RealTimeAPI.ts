/**
 * Rocket.Chat RealTime API
 */

import {
  webSocket,
  WebSocketSubject,
  WebSocketSubjectConfig
} from "rxjs/webSocket";
import { filter, buffer, flatMap, merge, map, tap } from "rxjs/operators";
import { v4 as uuid } from "uuid";
import { SHA256 } from "crypto-js";
import { Observable } from "rxjs";

export class RealTimeAPI {
  public webSocket: WebSocketSubject<any>;

  constructor(param: string | WebSocketSubjectConfig<any>) {
    this.webSocket = webSocket(param);
  }

  /**
   * Returns the Observable to the RealTime API Socket
   */
  public getObservable(): WebSocketSubject<any> {
    return this.webSocket;
  }

  /**
   * Disconnect the WebSocket Connection between client and RealTime API
   */
  public disconnect(): void{
    this.webSocket.unsubscribe();
  }

  /**
   * onMessage
   */
  public onMessage(messageHandler?: ((value: {}) => void) | undefined): void {
    this.subscribe(messageHandler, undefined, undefined);
  }

  /**
   * onError
   */
  public onError(errorHandler?: ((error: any) => void) | undefined): void {
    this.subscribe(undefined, errorHandler, undefined);
  }

  /**
   * onCompletion
   */
  public onCompletion(completionHandler?: (() => void) | undefined): void {
    this.subscribe(undefined, undefined, completionHandler);
  }

  /**
   * Subscribe to the WebSocket of the RealTime API
   */
  public subscribe(
    messageHandler?: ((value: {}) => void) | undefined,
    errorHandler?: ((error: any) => void) | undefined,
    completionHandler?: (() => void) | undefined
  ): void {
    this.getObservable().subscribe({
      next: messageHandler,
      error: errorHandler,
      complete: completionHandler
    });
  }

  /**
   * sendMessage to Rocket.Chat Server
   */
  public sendMessage(messageObject: any): void {
    this.webSocket.next(messageObject);
  }

  /**
   * getObservableFilteredByMessageType
   */
  public getObservableFilteredByMessageType(messageType: string): Observable<any> {
    return this.getObservable().pipe(
      filter((message: any) => message.msg === messageType)
    );
  }

  /**
   * getObservableFilteredByID
   */
  public getObservableFilteredByID(id: string): Observable<any> {
    return this.getObservable().pipe(
      filter((message: any) => message.id === id)
    );
  }

  /**
   * connectToServer
   */
  public connectToServer(): Observable<any> {
    this.sendMessage({
      msg: "connect",
      version: "1",
      support: ["1", "pre2", "pre1"]
    });
    return this.getObservableFilteredByMessageType("connected");
  }

  /**
   * Returns an Observable to subscribe to keepAlive, Ping and Pong to the Rocket.Chat Server to Keep the Connection Alive.
   */
  public keepAlive(): Observable<any> {
    return this.getObservableFilteredByMessageType("ping").pipe(
      tap(() => this.sendMessage({ msg: "pong" }))
    );
  }

  /**
   * Login with Username and Password
   */
  public login(username: string, password: string): Observable<any> {
    let id = uuid();
    let usernameType = username.indexOf("@") !== -1 ? "email" : "username";
    this.sendMessage({
      msg: "method",
      method: "login",
      id: id,
      params: [
        {
          user: { [usernameType]: username },
          password: {
            digest: SHA256(password).toString(),
            algorithm: "sha-256"
          }
        }
      ]
    });
    return this.getLoginObservable(id);
  }

  /**
   * Login with Authentication Token
   */
  public loginWithAuthToken(authToken: string): Observable<any> {
    let id = uuid();
    this.sendMessage({
      msg: "method",
      method: "login",
      id: id,
      params: [{ resume: authToken }]
    });
    return this.getLoginObservable(id);
  }

  /**
   * Login with OAuth, with Client Token and Client Secret
   */
  public loginWithOAuth(credToken: string, credSecret: string): Observable<any> {
    let id = uuid();
    this.sendMessage({
      msg: "method",
      method: "login",
      id: id,
      params: [
        {
          oauth: {
            credentialToken: credToken,
            credentialSecret: credSecret
          }
        }
      ]
    });
    return this.getLoginObservable(id);
  }

  /**
   * getLoginObservable
   */
  public getLoginObservable(id: string): Observable<any> {
    let resultObservable = this.getObservableFilteredByID(id);
    let resultId: string;

    let addedObservable = this.getObservable().pipe(
      buffer(
        resultObservable.pipe(
          map(({ msg, error, result }) => {
            if (msg === "result" && !error) return (resultId = result.id); // Setting resultId to get Result from the buffer
          })
        )
      ),
      flatMap(x => x), // Flattening the Buffered Messages
      filter(({ id: msgId }) => resultId !== undefined && msgId === resultId), //Filtering the "added" result message.
      merge(resultObservable) //Merging "result" and "added" messages.
    );

    return addedObservable;
  }

  /**
   * Get Observalble to the Result of Method Call from Rocket.Chat Realtime API
   */
  public callMethod(method: string, ...params: Array<{}>): Observable<any> {
    let id = uuid();
    this.sendMessage({
      msg: "method",
      method,
      id,
      params
    });
    return this.getObservableFilteredByID(id);
  }

  /**
   * getSubscription
   */
  public getSubscription(
    streamName: string,
    streamParam: string,
    addEvent: boolean
  ): Observable<any> {
    let id = uuid();
    return this.webSocket.multiplex(
      () => ({
        msg: "sub",
        id: id,
        name: streamName,
        params: [streamParam, addEvent]
      }),
      () => ({
        msg: "unsub",
        id: id
      }),
      (message: any) =>
        typeof message.collection === "string" &&
        message.collection === streamName &&
        message.fields.eventName === streamParam // Proper Filtering to be done. This is temporary filter just for the stream-room-messages subscription
    );
  }
}
