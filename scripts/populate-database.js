import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { readFileSync } from "fs";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.DYNAMODB_TABLE || "GolfOutingTable";

const dbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

const players = JSON.parse(readFileSync("./players.json", "utf-8"));

const overwritePlayer = async (player) => {
    try {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: player.id,
                    name: player.name,
                    handicap: player.handicap,
                    nickname: player.nickname,
                    bio: player.bio,
                    prediction: player.prediction,
                },
            })
        );
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
