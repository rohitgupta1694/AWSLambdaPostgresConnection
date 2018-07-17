"use strict";

//Inclide required node modules and db configuration values
const pg = require("pg");
const databaseUser = process.env.DB_USER;
const databasePassword = process.env.DB_PASSWORD;
const databaseName = process.env.DB_NAME;
const databaseHost = process.env.DB_HOST;
const databasePort = process.env.DB_PORT;
const databaseMaxCon = process.env.DB_MAX_CONNECTIONS;
const databaseIdleTimeout = process.env.DB_IDLE_TIMEOUT;
const databaseConnectionTimeout = process.env.DB_CONNECTION_TIMEOUT;

let dbConfig = {
  user: databaseUser,
  password: databasePassword,
  database: databaseName,
  host: databaseHost,
  port: databasePort,
  max: databaseMaxCon,
  idleTimeoutMillis: databaseIdleTimeout,
  connectionTimeoutMillis: databaseConnectionTimeout
};

//Starting point of Lambda function
exports.connectWithPostgres = (event, context, callback) => {
  console.log(
    "Received event : " + JSON.stringify(event) + " at " + new Date()
  );

  let pool = new pg.Pool(dbConfig);
  pool.connect(function(err, client, done) {
    console.log("Postgres Connection Status:", "Initiated");
    if (err) {
      console.log(
        "Postgres Connection Status:",
        "Error connecting to pg server" + err.stack
      );

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: "Error connecting to pg server",
          input: err.stack
        })
      };

      callback(null, response);
    } else {
      console.log(
        "Postgres Connection Status:",
        "Connection established with pg db server"
      );

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: "",
          input: done
        })
      };

      //Write a simple query to verify the connection.
      var a = client.query("SELECT COUNT(*) FROM users", (err, res) => {
        console.log("Postgres Query Status:", "Initiated");

        if (err) {
          console.error(
            "Postgres Query Status:",
            "Error executing query on postgres db" + err.stack
          );
          callback(err);
        } else {
          console.error("Postgres Query Status:", "Got query results" + res);

          callback(null, { total_users: res["rows"][0]["count"] });
        }

        //Make sure to release the client and end the postgres pool after the work is done.
        client.release();
        pool.end();
        console.log("Ending lambda at " + new Date());
      });
    }
  });
};
