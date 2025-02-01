const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const REGION = process.env.AWS_REGION || 'us-east-1';
const PLAYERS_TABLE = process.env.DYNAMODB_PLAYERS_TABLE || 'GolfOutingPlayersTable';
const COURSES_TABLE = process.env.DYNAMODB_COURSES_TABLE || 'GolfOutingCoursesTable';

const dbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        const { httpMethod, path, queryStringParameters, body } = event;
        let requestBody = body ? JSON.parse(body) : null;

        if (httpMethod === 'GET' && path.includes('/players')) {
            return queryStringParameters?.id
                ? await getItem(PLAYERS_TABLE, queryStringParameters.id)
                : await listItems(PLAYERS_TABLE);
        }
        if (httpMethod === 'POST' && path.includes('/players')) {
            return requestBody ? await addItem(PLAYERS_TABLE, requestBody) : formatResponse(400, { message: 'playerData is required' });
        }
        if (httpMethod === 'PUT' && path.includes('/players')) {
            return requestBody?.id && requestBody?.updateData
                ? await updateItem(PLAYERS_TABLE, requestBody.id, requestBody.updateData)
                : formatResponse(400, { message: 'playerId and updateData are required' });
        }

        if (httpMethod === 'GET' && path.includes('/courses')) {
            return queryStringParameters?.id
                ? await getItem(COURSES_TABLE, queryStringParameters.id)
                : await listItems(COURSES_TABLE);
        }
        if (httpMethod === 'POST' && path.includes('/courses')) {
            return requestBody ? await addItem(COURSES_TABLE, requestBody) : formatResponse(400, { message: 'courseData is required' });
        }
        if (httpMethod === 'PUT' && path.includes('/courses')) {
            return requestBody?.id && requestBody?.updateData
                ? await updateItem(COURSES_TABLE, requestBody.id, requestBody.updateData)
                : formatResponse(400, { message: 'courseId and updateData are required' });
        }
        if (httpMethod === 'DELETE' && path.includes('/courses')) {
            return queryStringParameters?.id ? await deleteItem(COURSES_TABLE, queryStringParameters.id) : formatResponse(400, { message: 'courseId is required' });
        }

        return formatResponse(400, { message: `Unsupported operation for ${httpMethod} ${path}` });
    } catch (error) {
        console.error('Error processing event:', error);
        return formatResponse(500, { message: 'Internal server error', error: error.message });
    }
};

// Fetch all items from a table
const listItems = async (tableName) => {
    try {
        const data = await docClient.send(new ScanCommand({ TableName: tableName }));
        return formatResponse(200, data.Items);
    } catch (error) {
        console.error(`Error listing items in ${tableName}:`, error);
        return formatResponse(500, { message: `Failed to list items in ${tableName}`, error: error.message });
    }
};

// Fetch a single item by ID
const getItem = async (tableName, id) => {
    try {
        const data = await docClient.send(new GetCommand({ TableName: tableName, Key: { id } }));
        return data.Item ? formatResponse(200, data.Item) : formatResponse(404, { message: 'Item not found' });
    } catch (error) {
        console.error(`Error fetching item from ${tableName}:`, error);
        return formatResponse(500, { message: `Failed to fetch item from ${tableName}`, error: error.message });
    }
};

// Add a new item (assigning an ID if missing)
const addItem = async (tableName, itemData) => {
    try {
        itemData.id = itemData.id || uuidv4();
        await docClient.send(new PutCommand({ TableName: tableName, Item: itemData }));
        return formatResponse(201, { message: 'Item added successfully', id: itemData.id });
    } catch (error) {
        console.error(`Error adding item to ${tableName}:`, error);
        return formatResponse(500, { message: `Failed to add item to ${tableName}`, error: error.message });
    }
};

// Update an existing item
const updateItem = async (tableName, id, updateData) => {
    try {
        const updateExpressions = [];
        const expressionAttributeValues = {};

        for (const key in updateData) {
            updateExpressions.push(`${key} = :${key}`);
            expressionAttributeValues[`:${key}`] = updateData[key];
        }

        await docClient.send(new UpdateCommand({
            TableName: tableName,
            Key: { id },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
        }));

        return formatResponse(200, { message: 'Item updated successfully' });
    } catch (error) {
        console.error(`Error updating item in ${tableName}:`, error);
        return formatResponse(500, { message: `Failed to update item in ${tableName}`, error: error.message });
    }
};

// Delete an item
const deleteItem = async (tableName, id) => {
    try {
        await docClient.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
        return formatResponse(200, { message: 'Item deleted successfully' });
    } catch (error) {
        console.error(`Error deleting item from ${tableName}:`, error);
        return formatResponse(500, { message: `Failed to delete item from ${tableName}`, error: error.message });
    }
};

// Helper function to format responses
const formatResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
});
