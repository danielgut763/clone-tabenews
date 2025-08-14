import database from "infra/database.js";


async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const postgresVersion = await database.query("SHOW server_version;");
  const postgresVersionResult = postgresVersion.rows[0].server_version;

  const maxConnections = await database.query("SHOW max_connections;");
  const maxConnectionsResult = maxConnections.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const connectionsUsed = await database.query({
    text: "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = $1",
    values: [databaseName]
  });
  const connectionsUsedResult = connectionsUsed.rows[0].count;


  response.status(200).json({ 
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: postgresVersionResult,
        max_connections: parseInt(maxConnectionsResult),
        connections_used: parseInt(connectionsUsedResult)
      }
    },
    
   });
}

export default status;