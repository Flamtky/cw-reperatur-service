import * as WebServer from "./util/WebServer";
import HttpFileHandler from "./util/HttpFileHandler";
import HttpRateLimiter from "./util/HttpRateLimiter";
import AuthHandler from "./api/authHandler";

function startWebServer() {
    WebServer.addHttpListener(new HttpRateLimiter(200, 5*60*1000, "/"));
    WebServer.addHttpPathHandler(new HttpFileHandler("web", "/api", new AuthHandler()));
    WebServer.addHttpPathHandler(new HttpFileHandler("web", "/"));
    WebServer.start();
}

function main() {
    startWebServer();
}

main();