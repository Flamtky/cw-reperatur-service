// Author: Finn Watermann (@HerrVergesslich)
import FileSystem from "fs";

export default function getErrorPage(code : number, customPlaceholders? : [{name : string, value : string}]) : Buffer {
    if(FileSystem.existsSync("./web/error/" + code + ".html")) {
        return FileSystem.readFileSync("./web/error/" + code + ".html");
    } else if(FileSystem.existsSync("./web/error/template.html")){
        let reason : string = getErrorReason(code);
        let description : string = getErrorDescription(code);
        let funny : string = getErrorFunny(code);
        let template = FileSystem.readFileSync("./web/error/template.html").toString("utf-8");
        while(template.indexOf("{ERROR_CODE}") != -1) template = template.replace("{ERROR_CODE}", "" + code);
        while(template.indexOf("{ERROR_REASON}") != -1) template = template.replace("{ERROR_REASON}", reason);
        while(template.indexOf("{ERROR_DESCRIPTION}") != -1) template = template.replace("{ERROR_DESCRIPTION}", description);
        while(template.indexOf("{ERROR_FUNNY}") != -1) template = template.replace("{ERROR_FUNNY}", funny);

        if(customPlaceholders != undefined) {
            for (let i = 0; i < customPlaceholders.length; i++) {
                while(template.indexOf(customPlaceholders[i].name) != -1) template = template.replace(customPlaceholders[i].name, customPlaceholders[i].value);
            }
        }

        return Buffer.from(template);
    } else {
        return Buffer.from(`<h1>Error ${code}: ${getErrorReason(code)}</h1>`);
    }
}

export function getErrorReason(code : number) : string {
    switch(code) {
        case 100: return 'Continue';
        case 101: return 'Switching Protocols';
        case 102: return 'Processing';
        case 200: return 'OK';
        case 201: return 'Created';
        case 202: return 'Accepted';
        case 203: return 'Non-Authoritative Information';
        case 204: return 'No Content';
        case 205: return 'Reset Content';
        case 206: return 'Partial Content';
        case 207: return 'Multi-Status';
        case 226: return 'IM Used';
        case 300: return 'Multiple Choices';
        case 301: return 'Moved Permanently';
        case 302: return 'Found';
        case 303: return 'See Other';
        case 304: return 'Not Modified';
        case 305: return 'Use Proxy';
        case 306: return 'Reserved';
        case 307: return 'Temporary Redirect';
        case 400: return 'Bad Request';
        case 401: return 'Unauthorized';
        case 402: return 'Payment Required';
        case 403: return 'Forbidden';
        case 404: return 'Not Found';
        case 405: return 'Method Not Allowed';
        case 406: return 'Not Acceptable';
        case 407: return 'Proxy Authentication Required';
        case 408: return 'Request Timeout';
        case 409: return 'Conflict';
        case 410: return 'Gone';
        case 411: return 'Length Required';
        case 412: return 'Precondition Failed';
        case 413: return 'Request Entity Too Large';
        case 414: return 'Request-URI Too Long';
        case 415: return 'Unsupported Media Type';
        case 416: return 'Requested Range Not Satisfiable';
        case 417: return 'Expectation Failed';
        case 422: return 'Unprocessable Entity';
        case 423: return 'Locked';
        case 424: return 'Failed Dependency';
        case 426: return 'Upgrade Required';
        case 429: return 'Too Many Requests';
        case 500: return 'Internal Server Error';
        case 501: return 'Not Implemented';
        case 502: return 'Bad Gateway';
        case 503: return 'Service Unavailable';
        case 504: return 'Gateway Timeout';
        case 505: return 'HTTP Version Not Supported';
        case 506: return 'Variant Also Negotiates';
        case 507: return 'Insufficient Storage';
        case 510: return 'Not Extended';
        default: return "Some Error";
    }
}

export function getErrorDescription(code : number) : string {
    switch(code) {
        case 400: return "Dein Browser hat eine Anfrage gesendet, die der Server nicht verstehen konnte.";
        case 401: return "Du scheinst nicht berechtigt zu sein, dieses Dokument sehen zu dürfen.";
        case 402: return "Für diesen Inhalt wird eine Bezahlung benötigt.";
        case 403: return "Das ist nicht erlaubt!";
        case 404: return "Wir konnten nicht finden wonach du suchst.";
        case 405: return "Die verwendete Methode ist für diese URL nicht erlaubt!";
        case 406: return "Es konnte keine Ressource im gewünschten Format unter der der URL gefunden werden.";
        case 407: return "Du scheinst nicht berechtigt zu sein eine Verbindung zur Proxy herstellen zu dürfen.";
        case 408: return "Dein Browser hat nicht rechtzeitig eine vollständige Anfrage gesendet.";
        case 409: return "Es ist ein Konflikt aufgetreten. Bitte versuche es später erneut.";
        case 410: return "Die angeforderte Ressource steht nicht mehr auf dem Server zur Verfügung. Bitte entferne alle Referenzen zu dieser Ressource.";
        case 411: return "Dein Browser hat vergessen die Länge der gesendeten Daten mit zu senden. Ohne diese Informationen kann der Server deine Anfrage nicht verarbeiten.";
        case 412: return "Die Voraussetzungen für diese Anfrage sind nicht erfüllt.";
        case 413: return "Die Anfrage konnte nicht gesendet werden, da die gesendeten Daten zu groß waren.";
        case 414: return "Die URL hat die maximal zugelassene Länge für diesen Server überschritten.";
        case 415: return "Die übermittelten Daten sind in einem ungültigen oder nicht zugelassenen Format.";
        case 416: return "Der angeforderte Teil der Ressource ist ungültig oder steht auf dem Server nicht zur Verfügung.";
        case 417: return "Die Erwartungen im Anfragen-Kopf konnten vom Server nicht erfüllt werden.";
        case 422: return "Der Server konnte die gesendeten Daten zwar verstehen, konnte diese jedoch nicht verarbeiten.";
        case 423: return "Die angeforderte Ressource ist aktuell gesperrt.";
        case 424: return "Die Anfrage konnte nicht durchgeführt werden, da eine benötigte, früher ausgeführte Anfrage fehlgeschlagen ist.";
        case 425: return "Dein Browser war zu schnell! Die verschlüsselte Verbindung konnte nicht vollständig hergestellt werden, bevor eine Anfrage gesendet wurde.";
        case 426: return "Die angefragte Ressource kann nur über eine Verschlüsselte Verbindung angefragt werden. Bitte aktualisiere deinen Browser oder versuche die Ressource über https:// aufzurufen.";
        case 429: return "Du oder dein Browser haben zu viele Anfragen gesendet. Versuchs nach {NEXT_TRY} nochmal!";
        case 500: return "Beim Bearbeiten deiner Anfrage ist etwas schief gelaufen. Bitte versuche es später erneut.";
        case 501: return "Die Art der Anfrage wird nicht unterstützt.";
        case 502: return "Der Proxy-Server hat eine ungültige Antwort vom Server erhalten.";
        case 503: return "Der Server ist temporär nicht erreichbar. Dies geschieht möglicherweise auf Grund von Wartungsarbeiten oder Überlastung.";
        case 504: return "Der Proxy-Server hat nicht rechtzeitig eine Antwort vom Server erhalten.";
        case 505: return "Die verwendete HTTP-Version wird vom Server nicht unterstützt.";
        case 506: return "Die Inhaltsvereinbarung der Anfrage ergibt einen Zirkelbezug!";
        case 507: return "Der Speicher des Servers läuft derzeit über und kann deswegen keinen Platz für deine Anfrage finden. Bitte versuche es später noch einmal.";
        case 510: return "Die Anfrage enthält nicht alle Informationen, die die angefragte Server-Extension zwingend erwartet.";
        default: return "Whoops, da ist etwas schief gelaufen. Bitte versuche es später erneut."
    }
}

export function getErrorFunny(code : number) : string {
    switch(code) {
        case 500: return "Das ist nicht deine Schuld! Versuch es einfach später noch einmal.";
        case 404: return "Hast du dich vielleicht vertippt?";
        case 402: return "Give me your money!";
        case 400: return "Was auch immer du gemacht hast, es war nicht korrekt...";
        case 401: return "Na, falsches Passwort?";
        case 405: return "Ne so nicht hier. Mit dieser Methode brauchst du gar nicht erst anzukommen.";
        case 418: return "MENSCH DA IS NEN TEEPOTT IN DER KAFFEEMASCHINE UND KEIN KAFFEEPOTT!";
        case 429: return "Trink etwas, lauf ein paar mal durch den Raum oder schau wer noch so zuhause ist &#x1f92a;";
        default: return "";
    }
}