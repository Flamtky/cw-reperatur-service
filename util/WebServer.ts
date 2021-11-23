// Author: Finn Watermann (@HerrVergesslich)
import * as URL from "url";
import * as FileSystem from "fs";
import * as MIME from "mime";
import * as cookie from "cookie";
import * as Logger from "./Logger";
import * as Path from "path";
import * as https from "https";
import {ClientRequest, IncomingMessage, ServerResponse} from "http";
import {Duplex} from "stream";
import ErrorDocument from "./ErrorDocument";

let httpServer : https.Server;

const httpHandlers : HttpPathHandler[] = [];
const wsHandlers : WsPathHandler[] = [];
const httpListeners : HttpListener[] = [];

export function addHttpPathHandler(handler : HttpPathHandler) {
    if(httpHandlers.indexOf(handler) == -1) {
        httpHandlers.push(handler);
        Logger.info("Registered HTTP-Handler: " + handler.getPath());
    }
}

export function addWsPathHandler(handler : WsPathHandler) {
    if(wsHandlers.indexOf(handler) == -1) {
        wsHandlers.push(handler);
        Logger.info("Registered WebSocket-Handler: " + handler.getPath());
    }
}

export function addHttpListener(listener : HttpListener) {
    if(httpListeners.indexOf(listener) == -1) {
        let id = httpListeners.push(listener);
        Logger.info("Registered HttpListener Id:" + (id-1));
    }
}

function request(req: IncomingMessage, res: ServerResponse) {

    for(let i = 0; i < httpListeners.length; i ++) {
        if(!httpListeners[i].handle(req)) {
            httpListeners[i].onFalse(res);
            if(!res.writable || res.writableEnded) {
                return;
            }
        }
    }

    let rawPath : string = URL.parse(req.url as string).pathname as string;
    let pathname : string = URL.parse(req.url as string).pathname as string;
    if(pathname.startsWith("/")) {
        pathname = pathname.substr(1);
    }
    if(pathname.endsWith("/")) {
        pathname = pathname.substring(0, pathname.length-1);
    }
    let path : string[]  = pathname.split("/");
    let cookies : any = req.headers.cookie != undefined ? cookie.parse(req.headers.cookie) : "";

    let sync = true;

    if(path.length > 0) {
        let handled : boolean = false;
        for(let i : number = 0; i < httpHandlers.length; i ++) {
            let handler : HttpPathHandler = httpHandlers[i];
            if(rawPath.startsWith(handler.getPath())) {
                let result = handler.handle(req, res);
                if(result.handled) {
                    i = httpHandlers.length;
                    handled = true;
                }
                sync = result.sync == undefined ? true : result.sync;
            }
        }
        if(!handled) {
            res.writeHead(404, {"content-type": "text/html"});
            res.end(ErrorDocument(404));
        }
    } else {
        res.writeHead(404, {"content-type": "text/html"});
        res.end(ErrorDocument(404));
    }

    let requestHost = "";
    if(req.headers["x-forwarded-for"] != undefined) {
        requestHost = "[" + req.headers["x-forwarded-for"] + "] <- [" + req.socket.remoteAddress + "]"
    }
    let loggerString = "H:" + req.headers.host + ":" + req.socket.localPort + " | R:" + requestHost + " | V:" + req.httpVersion + " | M:" + req.method + " | S:" + (sync ? res.statusCode : "async") + " | P:" + (URL.parse(req.url as string).pathname as string) + " | From:" + req.headers.referer;
    Logger.info(loggerString);

}

function connectionUpgrade(req : any, socket : Duplex, head : any) {
    let rawURL : string = URL.parse(req.url).pathname as string;

    let handled : boolean = false;
    for(let i : number = 0; i < httpHandlers.length; i ++) {
        let handler : WsPathHandler = wsHandlers[i];
        if(handler != undefined && rawURL.startsWith(handler.getPath())) {
            handler.upgrade(req, socket, head);
            i = wsHandlers.length;
            handled = true;
        }
    }
    if(!handled) {
        Logger.warning("Unhandled ProtocolUpgrade: " + rawURL);
        socket.write("HTTP/1.1 501 Not implemented\r\n"+
                            "Upgrade: WebSocket\r\n"+
                            "Connection: Upgrade\r\n"+
                            "\r\n");
        socket.end();
    }

    let requestHost = "";
    if(req.headers["x-forwarded-for"] != undefined) {
        requestHost = "[" + req.headers["x-forwarded-for"] + "] <- [" + req.socket.remoteAddress + "]"
    } else {
        requestHost = req.socket.remoteAddress;
    }
    let loggerString = "H:" + req.headers.host + ":" + req.socket.localPort + " | R:" + requestHost + " | V:HTTP/" + req.httpVersion + " | M:" + req.method + " -> WebSocket | S: " + (handled ? 101 : 501) + " | P:" + (URL.parse(req.url).pathname as string) + " | From:" + req.headers.referer;
    Logger.info(loggerString);
    if(!handled) {
        socket.destroy();
    }
}

export function handleFileRequest(req: any, res: ServerResponse, rootDir: string, url? : string, doDirRedirect : boolean = true): void {

    let rawPath : string = URL.parse(req.url).pathname as string;
    let path: string = URL.parse(req.url).pathname as string;
    let fullPath = rootDir;
    if (url != undefined) {
        path = url;
    }

    fullPath = rootDir + (rootDir.endsWith("/") ? "" : "/") + (path.startsWith("/") ? path.substr(1) : path);

    if (FileSystem.existsSync(fullPath)) {
        if (FileSystem.lstatSync(fullPath).isDirectory()) {
            if (!path.endsWith("/") &&  !rawPath.endsWith("/") && doDirRedirect) {
                res.writeHead(302, {"location": URL.parse(req.url).pathname + "/"});
                res.end();
            } else {
                handleFileRequest(req, res, rootDir, path + (path.endsWith("/") ? "" : "/") + "index.html");
            }
        } else {
            let resolvedFullPath = Path.resolve(fullPath);
            let resolvedRootDir = Path.resolve(rootDir);
            if(resolvedFullPath.startsWith(resolvedRootDir)) {
                let mimeType: any = MIME.getType(fullPath);
                res.writeHead(200, {"content-type": mimeType});
                res.end(FileSystem.readFileSync(fullPath));
            } else {
                res.writeHead(401, {"content-type": "text/html"});
                res.end(ErrorDocument(401));
            }
        }
    } else {
        res.writeHead(404, {"content-type": "text/html"});
        res.end(ErrorDocument(404));
    }
}

export function start(ip:string = "127.0.0.1", port : number = 8080, key : string = "./cert/localhost.key.pem", cert : string = "./cert/localhost.crt.pem") {
    httpServer = new https.Server({
        key: FileSystem.readFileSync(key),
        cert: FileSystem.readFileSync(cert)
    }, request);
    httpServer.on("upgrade", connectionUpgrade);
    httpServer.listen(port, ip);
    Logger.info(`WebServer started on ${ip}:` + port);
}

export interface HttpPathHandler {
    handle(req : any, res : ServerResponse) : {handled: boolean, sync? : boolean};
    getPath() : string;
}

export interface WsPathHandler {
    upgrade(request : any, socket : any, head : any) : void;
    getPath() : string;
}

export interface HttpListener {
    handle(req : IncomingMessage) : boolean;
    onFalse(res : ServerResponse) : void;
    onTrue(res : ServerResponse) : void;
}
