const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'GolfOutingTable';

const dbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        const operation = event.operation || 'listPlayers';

        switch (operation) {
            case 'listPlayers':
                return await listPlayers();
            case 'getPlayer':
                return await getPlayer(event.playerId);
            case 'addPlayer':
                return await addPlayer(event.playerData);
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    } catch (error) {
        console.error('Error processing event:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};

const listPlayers = async () => {
    try {
        const data = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        console.error('Error listing players:', error);
        throw error;
    }
};

const getPlayer = async (playerId) => {
    try {
        const data = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { id: playerId },
        }));

        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Player not found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data.Item),
        };
    } catch (error) {
        console.error('Error getting player:', error);
        throw error;
    }
};

const addPlayer = async (playerData) => {
    try {
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: playerData,
        }));

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Player added successfully' }),
        };
    } catch (error) {
        console.error('Error adding player:', error);
        throw error;
    }
};
