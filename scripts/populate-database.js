import { readFileSync } from "fs";
import { join } from "path";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

// Configuration
const REGION = process.env.REGION || "us-east-1";
const TABLE_NAME = process.env.DYNAMODB_TABLE || "GolfOutingTable";

// Load players from players.json
const playersFile = join(process.cwd(), "players.json");
const players = JSON.parse(readFileSync(playersFile, "utf8"));

// Create DynamoDB client
const ddbClient = new DynamoDBClient({ region: REGION });

(async () => {
    try {
        for (const player of players) {
            const params = {
                TableName: TABLE_NAME,
                Item: {
                    id: { S: player.id.toString() },
                    name: { S: player.name },
                    handicap: { N: player.handicap.toString() },
                    bio: { S: player.bio },
                    prediction: { S: player.prediction }
                },
            };
            const command = new PutItemCommand(params);
            await ddbClient.send(command);
            console.log(`Added player: ${JSON.stringify(player)}`);
        }
        console.log("Database population complete!");
    } catch (err) {
        console.error("Error populating database:", err);
    }
})();
