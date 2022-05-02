// Author: Finn Watermann (@HerrVergesslich)
import {HttpListener} from "./WebServer";
import {IncomingMessage, ServerResponse} from "http";
import * as Logger from "./Logger";
import ErrorDocument from "./ErrorDocument";

export default class HttpRateLimiter implements HttpListener {

	private readonly rateLimit : number;
	private readonly path : string;

	private nextReset : number = 0;
	private rates : Map<string, number> = new Map<string, number>();

	constructor(rateLimit : number, resetTime : number, listenPath : string = "/") {
		let self = this;
		this.rateLimit = rateLimit;
		this.path = listenPath
		setInterval(() => {
			self.rates.clear();
			this.nextReset = new Date().getTime() + resetTime;
			Logger.info("RateLimits have been reset. Next Reset: " + new Date(this.nextReset).toLocaleTimeString());
		}, resetTime);
		this.nextReset = new Date().getTime() + resetTime;
		//Logger.info("Next Reset: " + new Date(this.nextReset).toLocaleTimeString());
	}

	handle(req: IncomingMessage): boolean {

		//Only check for this path
		if(!(req.url as string).trim().startsWith(this.path)) {
			return true;
		}

		let ip : string | undefined = undefined;
		if(req.headers["x-forwarded-for"] != undefined) {
			let forwarded = req.headers["x-forwarded-for"] + "";
			ip = forwarded.split(",")[0].trim();
		} else {
			ip = req.socket.remoteAddress as string;
		}
		if(ip == undefined || ip == "undefined") {
			return false;
		}
		ip = ip.toLowerCase().trim();
		if(!this.rates.has(ip)) {
			this.rates.set(ip, 0);
		}
		Logger.debug("IP-Address: " + ip);
		this.rates.set(ip, this.rates.get(ip) as number + 1);

		if(this.rates.get(ip) as number > this.rateLimit) {
			return false;
		} else {
			return true;
		}
	}

	onFalse(res: ServerResponse) {
		let nextTry = new Date(this.nextReset).toLocaleTimeString() + " Uhr";
		res.writeHead(429, "Too Many Requests");
		res.end(ErrorDocument(429, [{name: "{NEXT_TRY}", value: nextTry}]));
	}

	onTrue(res : ServerResponse) {}


}