// Author: Finn Watermann (@HerrVergesslich)
import * as WebServer from "./WebServer";
import * as Logger from "./Logger";
import * as URL from "url";
import {IncomingMessage, ServerResponse} from "http";
import * as Cookie from "cookie";
import {Session} from "./SessionManager";
import * as SessionManager from "./SessionManager";

export default class HttpFileHandler implements WebServer.HttpPathHandler {

    rootDir : string;
    path : string;
    authenticator : Authenticator | undefined;
    customHandler : CustomHandler | undefined;

    constructor(rootDir : string, requestPath : string, authenticator? : Authenticator, customHandler? : CustomHandler) {
        this.rootDir = rootDir;
        this.path = requestPath;
        this.authenticator = authenticator;
        this.customHandler = customHandler;
    }

    handle(req : any, res : ServerResponse) : {handled : boolean, sync? : boolean} {
        try {

            if(this.customHandler != undefined) {
                let rawQuery : string | null = URL.parse(req.url as string).query;
                let rawPath : string = URL.parse(req.url as string).pathname as string;
                let rawCookies : string | undefined = req.headers.cookie;
                let pathParts : string[] = (rawPath.startsWith("/") ? rawPath.substr(1) : rawPath).split("/");
                let query : Map<string, string> = new Map<string, string>();
                let cookies : {[p: string]: string} = rawCookies == undefined ? {} : Cookie.parse(rawCookies);

                //URL-Query
                if(rawQuery != null) {
                    let pairs = rawQuery.split("&");
                    for (let a = 0; a < pairs.length; a ++) {
                        let raw : string[] = pairs[a].split("=");
                        let key = decodeURIComponent(raw[0]);
                        let value = decodeURIComponent(raw[1]);
                        query.set(key, value);
                    }
                }

                let handleState : State = this.customHandler.handle(req, res, pathParts, query, cookies);
                if(handleState == State.HANDLED || handleState == State.WILL_HANDLE_ASYNC) return {handled: true, sync: handleState != State.WILL_HANDLE_ASYNC};
            }

            if(this.authenticator == undefined) {
                let pathname : string = URL.parse(req.url).pathname as string;
                WebServer.handleFileRequest(req, res, this.rootDir, pathname.replace(this.path, ""));
                return {handled: true};
            } else {
                let handled = false;
                if(!this.authenticator.isAuthenticated(req)) {
                    handled = this.authenticator.onNotAuthenticated(req, res);
                } else {
                    handled = this.authenticator.onAuthenticated(req, res);
                }
                if(!res.writableEnded && !handled) {
                    let pathname : string = URL.parse(req.url).pathname as string;
                    WebServer.handleFileRequest(req, res, this.rootDir, pathname.replace(this.path, ""));
                }
                return {handled: true};
            }
        } catch(e:any) {
            Logger.error("Error while handling HTTP-Request: " + e);
            Logger.error("Stacktrace: " + e.stack);
        }
        return {handled: false};
    }

    getPath(): string {
        return this.path;
    }

}

export function parseCookies(rawCookies : string) : Map<string, string> {
    let ret : Map<string, string> = new Map<string, string>();
    for(let a in rawCookies.split("; ")) {

    }
    return ret;
}

export enum State {
    HANDLED,
    WILL_HANDLE_ASYNC,
    UNHANDLED
}

export interface Authenticator {

    isAuthenticated(req : IncomingMessage) : boolean;
    onNotAuthenticated(req : IncomingMessage, res : ServerResponse) : boolean;
    onAuthenticated(req : IncomingMessage, res : ServerResponse) : boolean;

}

export interface CustomHandler {
    handle(req : IncomingMessage, res : ServerResponse, pathParts : string[], query : Map<string, string>, cookies : {[p: string]: string}) : State;
}
