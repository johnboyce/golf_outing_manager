const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {v4: uuidv4} = require('uuid');
const {
    DynamoDBDocumentClient,
    ScanCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand
} = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.AWS_REGION || 'us-east-1';
const PLAYERS_TABLE = process.env.DYNAMODB_PLAYERS_TABLE || 'GolfOutingPlayersTable';
const COURSES_TABLE = process.env.DYNAMODB_COURSES_TABLE || 'GolfOutingCoursesTable';

const dbClient = new DynamoDBClient({region: REGION});
const docClient = DynamoDBDocumentClient.from(dbClient);

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const httpMethod = event.requestContext?.http?.method; // Get HTTP method
    const path = event.rawPath; // Get request path

    console.log(`HTTP Method: ${httpMethod}, Path: ${path}`);

    let operation;
    if (httpMethod === "GET" && path === "/players") {
        operation = "listPlayers";
    } else if (httpMethod === "GET" && path === "/courses") {
        operation = "listCourses";
    } else {
        return formatResponse(400, { message: `Unsupported operation for ${httpMethod} ${path}` });
    }

    console.log(`Resolved operation: ${operation}`);

    try {
        switch (operation) {
            case "listPlayers":
                return await listItems(PLAYERS_TABLE);
            case "listCourses":
                return await listItems(COURSES_TABLE);
            default:
                return formatResponse(400, { message: `Unhandled operation: ${operation}` });
        }
    } catch (error) {
        console.error("Error processing event:", error);
        return formatResponse(500, { message: "Internal server error", error: error.message });
    }
};


// Fetch all items from a table
const listItems = async (tableName) => {
    try {
        const data = await docClient.send(new ScanCommand({TableName: tableName}));
        return formatResponse(200, data.Items);
    } catch (error) {
        console.error(`Error listing items in ${tableName}:`, error);
        return formatResponse(500, {message: `Failed to list items in ${tableName}`, error: error.message});
    }
};

// Fetch a single item by ID
const getItem = async (tableName, id) => {
    try {
        const data = await docClient.send(new GetCommand({TableName: tableName, Key: {id}}));
        return data.Item ? formatResponse(200, data.Item) : formatResponse(404, {message: 'Item not found'});
    } catch (error) {
        console.error(`Error fetching item from ${tableName}:`, error);
        return formatResponse(500, {message: `Failed to fetch item from ${tableName}`, error: error.message});
    }
};

// Add a new item (assigning an ID if missing)
const addItem = async (tableName, itemData) => {
    try {
        itemData.id = itemData.id || uuidv4();
        await docClient.send(new PutCommand({TableName: tableName, Item: itemData}));
        return formatResponse(201, {message: 'Item added successfully', id: itemData.id});
    } catch (error) {
        console.error(`Error adding item to ${tableName}:`, error);
        return formatResponse(500, {message: `Failed to add item to ${tableName}`, error: error.message});
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
            Key: {id},
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
        }));

        return formatResponse(200, {message: 'Item updated successfully'});
    } catch (error) {
        console.error(`Error updating item in ${tableName}:`, error);
        return formatResponse(500, {message: `Failed to update item in ${tableName}`, error: error.message});
    }
};

// Delete an item
const deleteItem = async (tableName, id) => {
    try {
        await docClient.send(new DeleteCommand({TableName: tableName, Key: {id}}));
        return formatResponse(200, {message: 'Item deleted successfully'});
    } catch (error) {
        console.error(`Error deleting item from ${tableName}:`, error);
        return formatResponse(500, {message: `Failed to delete item from ${tableName}`, error: error.message});
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
