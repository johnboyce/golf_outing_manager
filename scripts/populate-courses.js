import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { readFileSync } from 'fs';

const REGION = 'us-east-1';
const TABLE_NAME = 'GolfOutingCoursesTable';

const client = new DynamoDBClient({ region: REGION });

const populateCoursesDatabase = async () => {
    const players = JSON.parse(readFileSync('./data/courses.json', 'utf-8'));

    for (const player of players) {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                id: { S: course.id },
                name: { S: course.name },
                image: { S: course.image },
                description: { S: course.description }
            }
        };

        try {
            await client.send(new PutItemCommand(params));
            console.log(`Successfully added course: ${player.name}`);
        } catch (error) {
            console.error(`Error adding course ${player.name}:`, error);
        }
    }
};

populateCoursesDatabase();
