import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { readFileSync } from 'fs';

const REGION = 'us-east-1';
const TABLE_NAME = 'GolfOutingTable';

const client = new DynamoDBClient({ region: REGION });

const populateDatabase = async () => {
    const players = JSON.parse(readFileSync('./players.json', 'utf-8'));

    for (const player of players) {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                id: { S: player.id },
                name: { S: player.name },
                nickname: { S: player.nickname },
                handicap: { N: String(player.handicap) },
                profileImage: { S: player.profileImage },
                bio: { S: player.bio },
                prediction: { S: player.prediction },
                teamLogo: { S: player.teamLogo }
            }
        };

        try {
            await client.send(new PutItemCommand(params));
            console.log(`Successfully added player: ${player.name}`);
        } catch (error) {
            console.error(`Error adding player ${player.name}:`, error);
        }
    }
};

populateDatabase();
