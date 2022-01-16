import express, { application, response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import DatabaseQueries from './DatabaseQueries';
dotenv.config({ path: './vars.env' });

const app: express.Application = express();
const port: number = 8080;

let apiCalls: number = 0;


app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/', async (req, res) => {
    //let result = await DatabaseQueries.executeQuery("SELECT * FROM cw");
    //res.json(result?.rows);
});

app.get('/api/auftraege', async (req, res) => {
    let result = await DatabaseQueries.executeQuery("SELECT * FROM AUFTRAEGE");
    try {
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createauftrag', async (req, res) => {
    let auftrag = req.body;
    console.log(auftrag);
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO AUFTRAEGE (AUFTRAGSNUMMER, KUNDENID, PLZ, AUFTRAGSSTRASSE, AUFTRAGSHAUSNUMMER, ARTDESAUFTRAGS, AUFTRAGSDATUM) VALUES (:AUFTRAGSNUMMER, :KUNDENID, :PLZ, :AUFTRAGSSTRASSE, :AUFTRAGSHAUSNUMMER, :ARTDESAUFTRAGS, :AUFTRAGSDATUM)",
            { AUFTRAGSNUMMER: auftrag.AUFTRAGSNUMMER, KUNDENID: auftrag.KUNDENID, PLZ: auftrag.PLZ, AUFTRAGSSTRASSE: auftrag.AUFTRAGSSTRASSE, AUFTRAGSHAUSNUMMER: auftrag.AUFTRAGSHAUSNUMMER, ARTDESAUFTRAGS: auftrag.ARTDESAUFTRAGS, AUFTRAGSDATUM: auftrag.AUFTRAGSDATUM });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deleteauftrag', async (req, res) => {
    let auftragsnummer = req.body.AUFTRAGSNUMMER;
    console.log(auftragsnummer);
    try {
        let result = await DatabaseQueries.executeQuery("DELETE FROM AUFTRAEGE WHERE AUFTRAGSNUMMER = :AUFTRAGSNUMMER",
            { AUFTRAGSNUMMER: auftragsnummer });
        console.log(result);
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.get('/api/kunden', async (req, res) => {
    try {
        if (Object.keys(req.query).length !== 1 && req.query._ != undefined) {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM KUNDEN", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } else if (req.query.KUNDENID != undefined) {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM KUNDEN WHERE KUNDENID = :KUNDENID", { KUNDENID: req.query.KUNDENID });
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/editkundenrabbat', async (req, res) => {
    let kundeid = req.body.KUNDENID;
    let rabatt = req.body.KUNDENRABATT;
    try {
        if (kundeid != undefined && rabatt != undefined) {
            let result = await DatabaseQueries.executeQuery("UPDATE KUNDEN SET KUNDENRABATT = :KUNDENRABATT WHERE KUNDENID = :KUNDENID",
                { KUNDENID: kundeid, KUNDENRABATT: rabatt });
            if (result?.rowsAffected == 0 || result?.rowsAffected == undefined) {
                res.status(404).json({ success: false });
            } else {
                res.status(200).json({ success: true });
            }
        } else {
            res.status(400).json({ success: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createkunde', async (req, res) => {
    let kunde = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO KUNDEN (KUNDENID, PLZ, KUNDENNAME, KUNDENSTRASSE, KUNDENHAUSNUMMER,KUNDENRABATT) VALUES (:KUNDENID, :PLZ, :KUNDENNAME, :KUNDENSTRASSE, :KUNDENHAUSNUMMER, :KUNDENRABATT)",
            { KUNDENID: kunde.KUNDENID, PLZ: kunde.PLZ, KUNDENNAME: kunde.KUNDENNAME, KUNDENSTRASSE: kunde.KUNDENSTRASSE, KUNDENHAUSNUMMER: kunde.KUNDENHAUSNUMMER, KUNDENRABATT: kunde.KUNDENRABATT });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deletekunde', async (req, res) => {
    let kundenid = req.body.KUNDENID;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE KUNDEN WHERE KUNDENID = :KUNDENID",
            { KUNDENID: kundenid });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.get('/api/mitarbeiter', async (req, res) => {
    try {
        if (Object.keys(req.query).length !== 1 && req.query._ != undefined) {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM MITARBEITER", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } else if (req.query.MITARBEITERID != undefined) {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM MITARBEITER WHERE MITARBEITERID = :MITARBEITERID", { KUNDENID: req.query.MITARBEITERID });
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createmitarbeiter', async (req, res) => {
    let mitarbeiter = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO MITARBEITER (MITARBEITERID, FIRMENID, VORNAME, NACHNAME, GEBURTSDATUM, STUNDENLOHN, IBAN, VERSICHERTENNUMMER, URLAUBSTAGE, ABTEILUNG, EINSTELLUNGSJAHR, AZUBI, FUHRERSCHEIN, TELEFON) \
            VALUES (:MITARBEITERID, :FIRMENID, :VORNAME, :NACHNAME, :GEBURTSDATUM, :STUNDENLOHN, :IBAN, :VERSICHERTENNUMMER, :URLAUBSTAGE, :ABTEILUNG, :EINSTELLUNGSJAHR, :AZUBI, :FUHRERSCHEIN, :TELEFON)",
            { MITARBEITERID: mitarbeiter.MITARBEITERID, FIRMENID: mitarbeiter.FIRMENID, VORNAME: mitarbeiter.VORNAME, NACHNAME: mitarbeiter.NACHNAME, GEBURTSDATUM: mitarbeiter.GEBURTSDATUM, STUNDENLOHN: mitarbeiter.STUNDENLOHN, IBAN: mitarbeiter.IBAN, VERSICHERTENNUMMER: mitarbeiter.VERSICHERTENNUMMER, URLAUBSTAGE: mitarbeiter.URLAUBSTAGE, ABTEILUNG: mitarbeiter.ABTEILUNG, EINSTELLUNGSJAHR: mitarbeiter.EINSTELLUNGSJAHR, AZUBI: mitarbeiter.AZUBI, FUHRERSCHEIN: mitarbeiter.FUHRERSCHEIN, TELEFON: mitarbeiter.TELEFON });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deletemitarbeiter', async (req, res) => {
    let mitarbeiterid = req.body.MITARBEITERID;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE MITARBEITER WHERE MITARBEITERID = :MITARBEITERID",
            { MITARBEITERID: mitarbeiterid });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.get('/api/rechnungen', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM RECHNUNG", {});
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createrechnung', async (req, res) => {
    let rechnung = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO RECHNUNG (RECHNUNGSNR, AUFTRAGSNUMMER, KUNDENID, SUMME, RECHNUNGSDATUM, ZAHLUNGSART, RABATT, LAUFZEIT, AUFPREIS, MITARBEITERZEITEN) \
        VALUES (:RECHNUNGSNR, :AUFTRAGSNUMMER, :KUNDENID, :SUMME, :RECHNUNGSDATUM, :ZAHLUNGSART, :RABATT, :LAUFZEIT, :AUFPREIS, :MITARBEITERZEITEN)",
            { RECHNUNGSNR: rechnung.RECHNUNGSNR, AUFTRAGSNUMMER: rechnung.AUFTRAGSNUMMER, KUNDENID: rechnung.KUNDENID, SUMME: rechnung.SUMME, RECHNUNGSDATUM: rechnung.RECHNUNGSDATUM, ZAHLUNGSART: rechnung.ZAHLUNGSART, RABATT: rechnung.RABATT, LAUFZEIT: rechnung.LAUFZEIT, AUFPREIS: rechnung.AUFPREIS, MITARBEITERZEITEN: rechnung.MITARBEITERZEITEN });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deleterechnung', async (req, res) => {
    let rechnungsnr = req.body.RECHNUNGSNR;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE RECHNUNG WHERE RECHNUNGSNR = :RECHNUNGSNR",
            { RECHNUNGSNR: rechnungsnr });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});


app.get('/api/lieferranten', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM LIEFERRANT", {});
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createlieferrant', async (req, res) => {
    let lieferrant = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO LIEFERRANT (LIEFERRANTENNR,LIEFERRANTENNAME,URL,EMAIL,BESTELLRABATT,LIEFERRANTENTELEFONNUMMER) \
        VALUES (:LIEFERRANTENNR,:LIEFERRANTENNAME,:URL,:EMAIL,:BESTELLRABATT,:LIEFERRANTENTELEFONNUMMER)",
            { LIEFERRANTENNR: lieferrant.LIEFERRANTENNR, LIEFERRANTENNAME: lieferrant.LIEFERRANTENNAME, URL: lieferrant.URL, EMAIL: lieferrant.EMAIL, BESTELLRABATT: lieferrant.BESTELLRABATT, LIEFERRANTENTELEFONNUMMER: lieferrant.LIEFERRANTENTELEFONNUMMER });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deletelieferrant', async (req, res) => {
    let lieferrantnr = req.body.LIEFERRANTENNR;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE LIEFERRANT WHERE LIEFERRANTENNR = :LIEFERRANTENNR",
            { LIEFERRANTENNR: lieferrantnr });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});


app.get('/api/bestellungen', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM BESTELLUNG", {});
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createbestellung', async (req, res) => {
    let BESTELLUNG = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO BESTELLUNG (BESTELLUNGSNR,LIEFERRANTENNR,LIEFERDATUM,BESTELLDATUM,BESTELLMENGE) \
        VALUES (:BESTELLUNGSNR,:LIEFERRANTENNR,:LIEFERDATUM,:BESTELLDATUM,:BESTELLMENGE)",
            { BESTELLUNGSNR: BESTELLUNG.BESTELLUNGSNR, LIEFERRANTENNR: BESTELLUNG.LIEFERRANTENNR, LIEFERDATUM: BESTELLUNG.LIEFERDATUM, BESTELLDATUM: BESTELLUNG.BESTELLDATUM, BESTELLMENGE: BESTELLUNG.BESTELLMENGE });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deletebestellung', async (req, res) => {
    let bestellungsnr = req.body.BESTELLUNGSNR;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE BESTELLUNG WHERE BESTELLUNGSNR = :BESTELLUNGSNR",
            { BESTELLUNGSNR: bestellungsnr });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});


app.get('/api/firmen', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM FIRMA", {});
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createfirma', async (req, res) => {
    let firma = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO FIRMA (FIRMENID,PLZ,FIRMENSTRASSE,FIRMENHAUSNUMMER) \
        VALUES (:FIRMENID,:PLZ,:FIRMENSTRASSE,:FIRMENHAUSNUMMER)",
            { FIRMENID: firma.FIRMENID, PLZ: firma.PLZ, FIRMENSTRASSE: firma.FIRMENSTRASSE, FIRMENHAUSNUMMER: firma.FIRMENHAUSNUMMER });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deletefirma', async (req, res) => {
    let firmenid = req.body.BESTELLUNGSNR;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE FIRMA WHERE FIRMENID = :FIRMENID",
            { FIRMENID: firmenid });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});


app.get('/api/firmenwagen', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM FIRMENWAGEN", {});
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createfirmenwagen', async (req, res) => {
    let firmenwagen = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO FIRMENWAGEN (KENNZEICHEN, FIRMENID, TUEV, TYP) \
        VALUES (:KENNZEICHEN,:FIRMENID,:TUEV,:TYP)",
            { KENNZEICHEN: firmenwagen.KENNZEICHEN, FIRMENID: firmenwagen.FIRMENID, TUEV: firmenwagen.TUEV, TYP: firmenwagen.TYP });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deletefirmenwagen', async (req, res) => {
    let kennzeichen = req.body.KENNZEICHEN;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE FIRMENWAGEN WHERE KENNZEICHEN = :KENNZEICHEN",
            { KENNZEICHEN: kennzeichen });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.get('/api/lager', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM LAGER", {});
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createlager', async (req, res) => {
    let lager = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO LAGER (LAGERID, FIRMENID, ARBEITSBEREICH) \
        VALUES (:LAGERID,:FIRMENID,:ARBEITSBEREICH)",
            { LAGERID: lager.LAGERID, FIRMENID: lager.FIRMENID, ARBEITSBEREICH: lager.ARBEITSBEREICH });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deletelager', async (req, res) => {
    let lagerid = req.body.LAGERID;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE LAGER WHERE LAGERID = :LAGERID",
            { LAGERID: lagerid });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});



app.get('/api/materialien', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM MATERIALIEN", {});
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/creatematerial', async (req, res) => {
    let material = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO MATERIALIEN (ARTIKELNUMMER, BESTELLUNGSNR, EINKAUFSPREIS, VERKAUFSPREIS, BEZEICHNUNG, BESTAND, KAPAZITAT, MINDESTBESTAND) \
        VALUES (:ARTIKELNUMMER,:BESTELLUNGSNR,:EINKAUFSPREIS,:VERKAUFSPREIS,:BEZEICHNUNG,:BESTAND,:KAPAZITAT,:MINDESTBESTAND)",
            { ARTIKELNUMMER: material.ARTIKELNUMMER, BESTELLUNGSNR: material.BESTELLUNGSNR, EINKAUFSPREIS: material.EINKAUFSPREIS, VERKAUFSPREIS: material.VERKAUFSPREIS, BEZEICHNUNG: material.BEZEICHNUNG, BESTAND: material.BESTAND, KAPAZITAT: material.KAPAZITAT, MINDESTBESTAND: material.MINDESTBESTAND });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deletematerial', async (req, res) => {
    let artikelnummer = req.body.ARTIKELNUMMER;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE MATERIALIEN WHERE ARTIKELNUMMER = :ARTIKELNUMMER",
            { ARTIKELNUMMER: artikelnummer });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.get('/api/preisaenderungen', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM PREISAENDERUNGEN", {});
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createpreisaenderung', async (req, res) => {
    let preisaenderung = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO PREISAENDERUNGEN (PREISID, ARTIKELNUMMER, ANDERUNGSDATUM, PREIS_ZU_DEM_ZEITPUNKT) \
        VALUES (:PREISID,:ARTIKELNUMMER,:ANDERUNGSDATUM,:PREIS_ZU_DEM_ZEITPUNKT)",
            { PREISID: preisaenderung.PREISID, ARTIKELNUMMER: preisaenderung.ARTIKELNUMMER, ANDERUNGSDATUM: preisaenderung.ANDERUNGSDATUM, PREIS_ZU_DEM_ZEITPUNKT: preisaenderung.PREIS_ZU_DEM_ZEITPUNKT });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deletepreisaenderung', async (req, res) => {
    let preisid = req.body.PREISID;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE PREISAENDERUNGEN WHERE PREISID = :PREISID",
            { PREISID: preisid });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.get('/api/getstadt', async (req, res) => {
    try {
        let plz = req.query.plz;
        let result = await DatabaseQueries.executeQuery("SELECT STADTNAME FROM STAEDTE WHERE PLZ = :PLZ", { PLZ: plz });
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.get('/api/getplz', async (req, res) => {
    try {
        let stadtname = req.query.stadtname;
        let result = await DatabaseQueries.executeQuery("SELECT PLZ FROM STAEDTE WHERE STADTNAME = :STADTNAME", { STADTNAME: stadtname });
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});



app.get('/api/unterweisungen', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM UNTERWEISUNG", {});
        let array: any[][] = [[]];
        array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
        res.status(200).json(array[0].concat(result?.rows));
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.post('/api/createunterweisung', async (req, res) => {
    let unterweisung = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO UNTERWEISUNG (UNTERWEISUNGSID, MITARBEITERID, UNTERWEISUNGSNAME) \
        VALUES (:UNTERWEISUNGSID,:MITARBEITERID,:UNTERWEISUNGSNAME)",
            { UNTERWEISUNGSID: unterweisung.UNTERWEISUNGSID, MITARBEITERID: unterweisung.MITARBEITERID, UNTERWEISUNGSNAME: unterweisung.UNTERWEISUNGSNAME });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.delete('/api/deleteunterweisung', async (req, res) => {
    let unterweisungsid = req.body.UNTERWEISUNGSID;
    try {
        let result = await DatabaseQueries.executeQuery("DELETE UNTERWEISUNG WHERE UNTERWEISUNGSID = :UNTERWEISUNGSID",
            { UNTERWEISUNGSID: unterweisungsid });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
    apiCalls++;
});

app.get('/api/apicalls', async (req, res) => {
    try {
        res.status(200).send(apiCalls);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }

    apiCalls++;
});

//---------------------------------Views---------------------------------

app.get('/api/wagen_verfuegbar', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM wagen_verfuegbar", {});
            if (result === undefined) {
                res.status(500).send("SQL Query Error");
            } else {
                let array: any[][] = [[]];
                array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
                res.status(200).json(array[0].concat(result?.rows));
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else if (req.query.kennzeichen != undefined) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM wagen_verfuegbar WHERE KENNZEICHEN = :KENNZEICHEN", { KENNZEICHEN: req.query.kennzeichen });
            if (result === undefined) {
                res.status(500).send("SQL Query Error");
            } else {
                let array: any[][] = [[]];
                array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
                res.status(200).json(array[0].concat(result?.rows));
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else if (req.query.datum != null) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM wagen_verfuegbar WHERE DATUM = :DATUM", { DATUM: req.query.datum });
            if (result === undefined) {
                res.status(500).send("SQL Query Error");
            } else {
                let array: any[][] = [[]];
                array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
                res.status(200).json(array[0].concat(result?.rows));
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});

app.get('/api/auftraege_ohne_Rechnung', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM auftraege_ohne_Rechnung", {});
            if (result === undefined) {
                res.status(500).send("SQL Query Error");
            } else {
                let array: any[][] = [[]];
                array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
                res.status(200).json(array[0].concat(result?.rows));
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});

app.get('/api/mitarbeiter_auftragsdatum', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM mitarbeiter_auftragsdatum", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});

app.get('/api/rechnung_summe', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM rechnung_summe", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});

app.get('/api/materialien_verbrauch_monat', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM materialien_verbrauch_monat", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});

app.get('/api/kunden_rabatt_rechnung', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM kunden_rabatt_rechnung", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});

app.get('/api/mitarbeiter_lager_fehlende_menge', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM mitarbeiter_lager_fehlende_menge", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});

app.get('/api/auftrag_invalid_material', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM auftrag_invalid_material", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});

app.get('/api/firmenwagen_belegt', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM firmenwagen_belegt", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});

app.get('/api/firma_stats', async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        try {
            let result = await DatabaseQueries.executeQuery("SELECT * FROM firma_stats", {});
            let array: any[][] = [[]];
            array[0].push((result?.metaData as unknown[]).map(x => (x as any).name));
            res.status(200).json(array[0].concat(result?.rows));
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false });
        }
    } else {
        console.log(req.query);
        res.status(404).json([]);
    }
    apiCalls++;
});







app.listen(port, () => console.log(`CW API running on port ${port}!`));


