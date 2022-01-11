import OracleDB from "oracledb";

let connection: OracleDB.Connection;

export async function connect() {
    OracleDB.initOracleClient({configDir: './api/databaseConfig'});
    try{
        console.log("Connecting to database...");
        connection = await OracleDB.getConnection({ user: "cw", password: "cwrs", connectionString: "ORCL" });
        console.log("Database connection established.");
    }catch(err){
        console.log(err);
    }

    let result = await connection.execute("SELECT table_name FROM all_tables where owner = 'CW'");
    console.log(result.rows);

}