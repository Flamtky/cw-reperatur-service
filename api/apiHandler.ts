import { IncomingMessage, ServerResponse } from "http";
import getErrorPage from "../util/ErrorDocument";
import { CustomHandler, State } from "../util/HttpFileHandler";


export default class ApiHandler implements CustomHandler {

    /**
     * #### The routes that are handled by this handler (all API routes)
     * - Key:   string = Method + "|" + URL (e.g. GET|PATH)
     * - Value: function = The function that handles the request (e.g. handlePath)
     */
    routes = new Map<string, Function>([
        ["GET|/api/users", this.handleUsers]
    ]);

    handle(req: IncomingMessage, res: ServerResponse, pathParts: string[], query: Map<string, string>, cookies: { [p: string]: string; }): State {
        if (this.isAuthed()) {
            if (req.url === undefined) {
                // Return 500
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end(getErrorPage(500));
                return State.HANDLED;
            } 
            let result = this.routes.get(req.method+"|"+req.url);
            if (result === undefined) {
                // Return 404
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end(getErrorPage(404));
                return State.HANDLED;
            }
            result(req, res);
            return State.WILL_HANDLE_ASYNC;
        } else {
            // Send a 401 response
            res.writeHead(401, {'Content-Type': 'text/html'});
            res.end(getErrorPage(401));
            return State.HANDLED;
        }
    }

    /**
     * Handles the request for the /api/users route
     * @param req user request
     * @param res response
     */
    async handleUsers(req: IncomingMessage, res: ServerResponse): Promise<void> {
        // Example user
        let user = {
            id: 1,
            name: "Max Mustermann",
            email: ""
        }; // TODO: Replace with real user from database
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(user));
    }

    // Check if the user is authenticated
    isAuthed() : boolean {
        return true;
    }
}
