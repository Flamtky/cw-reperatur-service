// Author: Finn Watermann (@HerrVergesslich)
import * as Logger from "./Logger";
import {WsPathHandler} from "./WebServer";
import {IncomingMessage} from "http";
import WebSocket = require("ws");

export default class WebSocketHandler implements WsPathHandler {

    name : string;
    requestURL : string;

    private onConnectCallback : (client:WebSocket, request : IncomingMessage) => void = () => {};
    private onDisconnectCallback : (client : WebSocket) => void = () => {};

    constructor(name : string, requestPath : string) {
        this.name = name;
        this.requestURL = requestPath;
    }

    wsServer = new WebSocket.Server({noServer: true});

    upgrade(request: any, socket: any, head: any): void {
        this.wsServer.handleUpgrade(request, socket, head, this.initWebsocketConnection.bind(this));
    }

    getPath(): string {
        return this.requestURL;
    }

    private initWebsocketConnection(client : WebSocket, request : IncomingMessage) {
        client.on("message", (message) => {
            Logger.debug(this.name + " | Received message: " + message);
        });

        client.on("close", function(this : WebSocketHandler, code : number, reason : Buffer) {
            Logger.info(this.name + " | Closed: " + code + " (" + reason + ")");
            this.onDisconnectCallback(client);
        }.bind(this));

        let requestHost = "";
        if(request.headers["x-forwarded-for"] != undefined) {
            requestHost = "[" + request.headers["x-forwarded-for"] + "] <- [" + request.socket.remoteAddress + "]"
        }
        Logger.info(this.name + " | " + requestHost + ":" + request.socket.remotePort + " => " + request.url);
        if(this.onConnectCallback != undefined) {
            this.onConnectCallback(client, request);
        }
    }

    onConnect(callback : (client : WebSocket, request : IncomingMessage) => void) {
        this.onConnectCallback = callback;
    }

    onDisconnect(callback : (client : WebSocket) => void) {
        this.onDisconnectCallback = callback;
    }

}