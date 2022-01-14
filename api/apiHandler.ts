import express, { application, response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import DatabaseQueries from './DatabaseQueries';
dotenv.config({ path: './vars.env' });

const app: express.Application = express();
const port: number = 8080;


app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/', async (req, res) => {
    //let result = await DatabaseQueries.executeQuery("SELECT * FROM cw");
    //res.json(result?.rows);
});

app.get('/api/auftraege', async (req, res) => {
    let result = await DatabaseQueries.executeQuery("SELECT * FROM AUFTRAEGE");
    res.json(result?.rows);
});

app.post('/api/createauftrag', async (req, res) => {
    let auftrag = req.body;
    console.log(auftrag);
    let result = await DatabaseQueries.executeQuery("INSERT INTO AUFTRAEGE (AUFTRAGSNUMMER, KUNDENID, PLZ, AUFTRAGSSTRASSE, AUFTRAGSHAUSNUMMER, MITARBEITERARBEITSZEIT, ARTDESAUFTRAGS, AUFTRAGSDATUM) VALUES (:AUFTRAGSNUMMER, :KUNDENID, :PLZ, :AUFTRAGSSTRASSE, :AUFTRAGSHAUSNUMMER, :MITARBEITERARBEITSZEIT, :ARTDESAUFTRAGS, :AUFTRAGSDATUM)",
        { AUFTRAGSNUMMER: auftrag.AUFTRAGSNUMMER, KUNDENID: auftrag.KUNDENID, PLZ: auftrag.PLZ, AUFTRAGSSTRASSE: auftrag.AUFTRAGSSTRASSE, AUFTRAGSHAUSNUMMER: auftrag.AUFTRAGSHAUSNUMMER, MITARBEITERARBEITSZEIT: auftrag.MITARBEITERARBEITSZEIT, ARTDESAUFTRAGS: auftrag.ARTDESAUFTRAGS, AUFTRAGSDATUM: auftrag.AUFTRAGSDATUM });
    res.status(200).json({ success: true });
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

});

app.get('/api/kunden', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM KUNDEN", {});
        res.status(200).json(result?.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
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
});

app.get('/api/mitarbeiter', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM MITARBEITER", {});
        res.status(200).json(result?.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
});

app.post('/api/createmitarbeiter', async (req, res) => {
    let mitarbeiter = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO MITARBEITER (MITARBEITERID, FIRMENID, VORNAME, NACHNAMEN, GEBURTSDATUM, STUNDENLOHN, IBAN, VERSICHERTENNUMMER, URLAUBSTAGE, ABTEILUNG, EINSTELLUNGSJAHR, AZUBI, FÜHRERSCHEIN, TELEFON) \
            VALUES (:MITARBEITERID, :FIRMENID, :VORNAME, :NACHNAMEN, :GEBURTSDATUM, :STUNDENLOHN, :IBAN, :VERSICHERTENNUMMER, :URLAUBSTAGE, :ABTEILUNG, :EINSTELLUNGSJAHR, :AZUBI, :FÜHRERSCHEIN, :TELEFON)",
            { MITARBEITERID: mitarbeiter.MITARBEITERID, FIRMENID: mitarbeiter.FIRMENID, VORNAME: mitarbeiter.VORNAME, NACHNAMEN: mitarbeiter.NACHNAMEN, GEBURTSDATUM: mitarbeiter.GEBURTSDATUM, STUNDENLOHN: mitarbeiter.STUNDENLOHN, IBAN: mitarbeiter.IBAN, VERSICHERTENNUMMER: mitarbeiter.VERSICHERTENNUMMER, URLAUBSTAGE: mitarbeiter.URLAUBSTAGE, ABTEILUNG: mitarbeiter.ABTEILUNG, EINSTELLUNGSJAHR: mitarbeiter.EINSTELLUNGSJAHR, AZUBI: mitarbeiter.AZUBI, FÜHRERSCHEIN: mitarbeiter.FÜHRERSCHEIN, TELEFON: mitarbeiter.TELEFON });
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
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

});

app.get('/api/rechnungen', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM RECHNUNG", {});
        res.status(200).json(result?.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
});

app.post('/api/createrechnung', async (req, res) => {
    let rechnung = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO RECHNUNG (RECHNUNGSNR, AUFTRAGSNUMMER, KUNDENID, SUMME, RECHNUNGSDATUM, ZAHLUNGSART, RABATT, LAUFZEIT, AUFPREIS) \
        VALUES (:RECHNUNGSNR, :AUFTRAGSNUMMER, :KUNDENID, :SUMME, :RECHNUNGSDATUM, :ZAHLUNGSART, :RABATT, :LAUFZEIT, :AUFPREIS)",
            { RECHNUNGSNR:rechnung.RECHNUNGSNR, AUFTRAGSNUMMER: rechnung.AUFTRAGSNUMMER, KUNDENID: rechnung.KUNDENID, SUMME: rechnung.SUMME, RECHNUNGSDATUM: rechnung.RECHNUNGSDATUM, ZAHLUNGSART: rechnung.ZAHLUNGSART, RABATT: rechnung.RABATT, LAUFZEIT: rechnung.LAUFZEIT, AUFPREIS: rechnung.AUFPREIS});
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
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

});


app.get('/api/lieferranten', async (req, res) => {
    try {
        let result = await DatabaseQueries.executeQuery("SELECT * FROM LIEFERRANT", {});
        res.status(200).json(result?.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
});

app.post('/api/createlieferrant', async (req, res) => {
    let lieferrant = req.body;
    try {
        let result = await DatabaseQueries.executeQuery("INSERT INTO LIEFERRANT (LIEFERRANTENNR,LIEFERRANTENNAME,URL,EMAIL,BESTELLRABATT,LIEFERRANTENTELEFONNUMMER) \
        VALUES (:LIEFERRANTENNR,:LIEFERRANTENNAME,:URL,:EMAIL,:BESTELLRABATT,:LIEFERRANTENTELEFONNUMMER)",
            { LIEFERRANTENNR:lieferrant.LIEFERRANTENNR,LIEFERRANTENNAME: lieferrant.LIEFERRANTENNAME,URL: lieferrant.URL,EMAIL: lieferrant.EMAIL,BESTELLRABATT: lieferrant.BESTELLRABATT,LIEFERRANTENTELEFONNUMMER: lieferrant.LIEFERRANTENTELEFONNUMMER});
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
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

});





app.listen(port, () => console.log(`CW API running on port ${port}!`));


