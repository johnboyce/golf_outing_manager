const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    const response = {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: "",
    };

    try {
        const method = event.httpMethod;

        switch (method) {
            case "GET":
                response.body = JSON.stringify(await listPlayers());
                break;
            case "POST":
                const player = JSON.parse(event.body);
                response.body = JSON.stringify(await addPlayer(player));
                break;
            default:
                response.statusCode = 405;
                response.body = JSON.stringify({ error: "Method not allowed" });
                break;
        }
    } catch (error) {
        console.error("Error handling request:", error);
        response.statusCode = 500;
        response.body = JSON.stringify({ error: "Internal Server Error" });
    }

    return response;
};

const listPlayers = async () => {
    const params = { TableName: TABLE_NAME };
    const result = await dynamoDB.scan(params).promise();
    return result.Items;
};

const addPlayer = async (player) => {
    const params = {
        TableName: TABLE_NAME,
        Item: player,
    };
    await dynamoDB.put(params).promise();
    return { message: "Player added successfully", player };
};
