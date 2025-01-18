import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { readFileSync } from "fs";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.DYNAMODB_TABLE || "GolfOutingTable";

const dbClient = new DynamoDBClient({ region: REGION });

const players = JSON.parse(readFileSync("./players.json", "utf-8"));

const overwritePlayer = async (player) => {
    try {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                id: { S: player.id },
                name: { S: player.name },
                handicap: { N: player.handicap.toString() },
                nickname: { S: player.nickname },
                bio: { S: player.bio },
                prediction: { S: player.prediction },
            },
        };

        const result = await dbClient.send(new PutItemCommand(params));
        console.log(`DynamoDB response:`, result);
        console.log(`Overwritten player: ${player.name}`);
    } catch (error) {
        console.error(`Error overwriting player ${player.name}:`, error);
    }
};

const main = async () => {
    for (const player of players) {
        await overwritePlayer(player);
    }
    console.log("Database overwrite complete!");
};

main().catch((error) => console.error("Error running script:", error));
