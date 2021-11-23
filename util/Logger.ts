// Author: Finn Watermann (@HerrVergesslich)
import * as FileSystem from "fs";
const enableDebug = true;
let isInit = false;

export function info(text : string) : void {
    output("[" + getTimeStamp() + "/INFO]: " + text);
}

export function debug(text: string) {
    if(!enableDebug) return;
    output("[" + getTimeStamp() + "/DEBUG]: " + text);
}

export function warning(text: string) {
    output("[" + getTimeStamp() + "/WARN]: " + text);
}

export function error(text: string) {
    output("[" + getTimeStamp() + "/ERROR]: " + text);
}

function output(text : string) : void {
    console.log(text);
    if(!isInit) initLog();
    FileSystem.appendFile("./logs/latest.log", text + "\n", ()=>{});
}

function initLog() {
    if(!FileSystem.existsSync("./logs")) {
        FileSystem.mkdirSync("./logs");
    }
    if(FileSystem.existsSync("./logs/latest.log")) {
        let newFileName = getTimeStamp("_", "_", true, "--", "_");
        FileSystem.renameSync("./logs/latest.log", "./logs/" + newFileName + ".log");
    }
    isInit = true;
}

function getTimeStamp(timeSeparator : string = ":", msSeparator : string = ".", date : boolean = false, dataSeparator : string = " ", dateSeparator : string = ".") : string {
    let d : Date = new Date();
    let ret : string;

    let hours : string = d.getHours() + "";
    let minutes : string = d.getMinutes() + "";
    let seconds : string = d.getSeconds() + "";
    let millis : string = d.getMilliseconds() + "";

    if(hours.length < 2) hours = "0" + hours;
    if(minutes.length < 2) minutes = "0" + minutes;
    if(seconds.length < 2) seconds = "0" + seconds;
    if(millis.length < 2) millis = "00" + millis;
    if(millis.length < 3) millis = "0" + millis;

    ret = hours + timeSeparator + minutes + timeSeparator + seconds + msSeparator + millis;

    if(date) {
        let day : string = d.getDate() + "";
        let month : string = d.getMonth() + "";
        let year : string = d.getFullYear() + "";
        if(day.length < 2) day = "0" + day;
        if(month.length < 2) month = "0" + month;
        if(year.length < 2) year = "000" + year;
        if(year.length < 3) year = "00" + year;
        if(year.length < 4) year = "0" + year;
        ret = day + dateSeparator + month + dateSeparator + year + dataSeparator + ret;
    }
    return ret;
}