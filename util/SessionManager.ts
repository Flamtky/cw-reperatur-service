// Author: Finn Watermann (@HerrVergesslich)
import * as UUID from "uuid";
import * as Logger from "./Logger";
import {ServerResponse} from "http";

const sessions : Map<string, Session> = new Map<string, Session>();

export function getSession(sessionId : string) : Session | undefined {
    return sessions.get(sessionId);
}

export function createSession() : Session {
    let id;
    do {
        id = UUID.v4().replace("-", "").replace("-", "").replace("-", "").replace("-", "");
    } while(sessions.has(id));
    let session : Session = new Session(id);
    sessions.set(id, session);
    Logger.info("Created Session: " + id);
    return session;
}

export function deleteSession(sessionId : string) : void {
    sessions.delete(sessionId);
}

export function autoSession(cookies : any, res : ServerResponse) : Session {
    let session : Session;
    if(cookies.verifySession == undefined) {
        session = createSession()
        res.setHeader("Set-Cookie", "verifySession=" + session.getId() + "; HttpOnly; Secure; Path=/");
    } else {
        let sessionId : string = cookies.verifySession;
        if(getSession(sessionId) == undefined) {
            session = createSession();
            res.setHeader("Set-Cookie", "verifySession=" + session.getId() + "; HttpOnly; Secure; Path=/");
        } else {
            session = getSession(sessionId) as Session;
        }
    }
    return session;
}

export class Session {

    private readonly sessionId : string;
    private expire : number;
    private storage : Map<string, any> = new Map<string, any>();

    constructor(sessionId : string) {
        this.sessionId = sessionId;
        this.expire = new Date().getTime() + 6 * 60 * 60 * 1000;
    }

    public getId() : string {
        return this.sessionId;
    }

    public getExpire() : number {
        return this.expire;
    }

    public refreshExpire() : void {
        this.expire = new Date().getTime() + 6 * 60 * 60 * 1000;
    }

    public get(name : string) : any {
        return this.storage.get(name);
    }


    public put(name : string, value : any) : void {
        this.storage.set(name, value);
    }

    public contains(name : string) : boolean {
        return this.storage.has(name);
    }

    public remove(name : string) : void {
        this.storage.delete(name);
    }

	public destroy() {
		deleteSession(this.sessionId);
		this.storage.clear();
	}
}