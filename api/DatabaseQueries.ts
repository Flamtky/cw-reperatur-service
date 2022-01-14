import OracleDB from "oracledb";

let connection: OracleDB.Pool;
export class DatabaseQueries {

    constructor() { }

    public static async getConnection(): Promise<OracleDB.Connection | undefined> {
        return new Promise<OracleDB.Connection | undefined>(async (resolve, reject) => {
            if (connection) {
                return resolve(OracleDB.getConnection());
            }
            try {
                OracleDB.initOracleClient({ configDir: './api/databaseConfig' });
                console.log("Connecting to database...");
                connection = await OracleDB.createPool({
                    user: "cw",
                    password: "cwrs",
                    connectString: "ORCL"
                });
                console.log("Database connection established.");
                resolve(OracleDB.getConnection());
            } catch (err) {
                console.log("Error connecting to database: \n" + err);
                console.log("Are you connected to the VPN?");
                reject(undefined)
            }
        });
    }
    public static async executeQuery(query: string,values:any = {}): Promise<OracleDB.Result<unknown> | undefined> {
        return new Promise<OracleDB.Result<unknown> | undefined>(async (resolve, reject) => {
            try {
                const connection = await this.getConnection();
                if (connection === undefined) throw new Error("Connection is undefined");
                const result = await connection?.execute(query,values);
                connection.commit();
                resolve(result);
            } catch (err) {
                console.log(err);
                reject(undefined);
            }
        });

    }


}

export default DatabaseQueries;

