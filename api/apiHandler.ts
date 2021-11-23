import { IncomingMessage, ServerResponse } from "http";
import getErrorPage from "../util/ErrorDocument";
import { CustomHandler, State } from "../util/HttpFileHandler";

export default class ApiHandler implements CustomHandler {

    handle(req: IncomingMessage, res: ServerResponse, pathParts: string[], query: Map<string, string>, cookies: { [p: string]: string; }): State {
        if (this.isAuthed()) {
            // TODO: Implement API handling
            return State.WILL_HANDLE_ASYNC;
        } else {
            // Send a 401 response
            res.writeHead(401, {'Content-Type': 'text/html'});
            res.end(getErrorPage(401));
            return State.HANDLED;
        }
    }

    // Check if the user is authenticated
    isAuthed() : boolean {
        return true;
    }
}