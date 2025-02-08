import json
import boto3
import time
import traceback
import decimal
import os
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.types import TypeDeserializer, TypeSerializer
from typing import List, Dict

# ✅ Load table names from environment variables (Best Practice)
dynamodb = boto3.resource("dynamodb")
players_table = dynamodb.Table(os.environ["DYNAMODB_PLAYERS_TABLE"])
courses_table = dynamodb.Table(os.environ["DYNAMODB_COURSES_TABLE"])
drafts_table = dynamodb.Table(os.environ["DYNAMODB_DRAFTS_TABLE"])

deserializer = TypeDeserializer()
serializer = TypeSerializer()

def lambda_handler(event, context):
    """Main entry point for API Gateway."""
    debug = event.get("queryStringParameters", {}).get("debug", "false").lower() == "true"

    try:
        log_debug("Received full event", event, debug)

        # Handle CORS preflight
        if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
            return generate_response(200, {"message": "CORS preflight successful"}, debug)

        path = event.get("rawPath", "")
        method = event.get("requestContext", {}).get("http", {}).get("method", "")

        routes = {
            "/players": handle_players,
            "/courses": handle_courses,
            "/drafts": handle_drafts
        }

        for route, handler in routes.items():
            if path.startswith(route):
                return handler(event, method, debug)

        return generate_response(404, {"error": "Not Found"}, debug)

    except Exception as e:
        return generate_error_response(e, debug)

def handle_players(event, method, debug):
    """Handles player-related API requests."""
    if method == "GET":
        return get_players(debug)
    if method == "POST":
        return process_request_body(event, create_player, debug)
    if method == "PUT":
        return process_request_body(event, update_player, debug)
    return generate_response(405, {"error": "Method Not Allowed"}, debug)

def get_players(debug=False):
    """Retrieves all players from DynamoDB."""
    try:
        response = players_table.scan()
        return generate_response(200, deserialize_items(response.get("Items", [])), debug)
    except Exception as e:
        return generate_error_response(e, debug)

def create_player(data, debug=False):
    """Creates a new player."""
    try:
        item = serialize_item(data)
        item["PK"] = f"PLAYER#{data['id']}"
        item["SK"] = "DETAILS"
        players_table.put_item(Item=item)
        return generate_response(201, {"player_id": data["id"]}, debug)
    except Exception as e:
        return generate_error_response(e, debug)

def update_player(data, debug=False):
    """Updates an existing player."""
    try:
        item = serialize_item(data)
        item["PK"] = f"PLAYER#{data['id']}"
        item["SK"] = "DETAILS"
        players_table.put_item(Item=item)
        return generate_response(200, {"player_id": data["id"], "message": "Player updated"}, debug)
    except Exception as e:
        return generate_error_response(e, debug)

def handle_courses(event, method, debug):
    """Handles course-related API requests."""
    if method == "GET":
        return get_courses(debug)
    if method == "POST":
        return process_request_body(event, create_course, debug)
    return generate_response(405, {"error": "Method Not Allowed"}, debug)

def get_courses(debug=False):
    """Retrieves all courses from DynamoDB."""
    try:
        response = courses_table.scan()
        return generate_response(200, deserialize_items(response.get("Items", [])), debug)
    except Exception as e:
        return generate_error_response(e, debug)

def create_course(data, debug=False):
    """Creates a new course."""
    try:
        item = serialize_item(data)
        item["PK"] = f"COURSE#{data['id']}"
        item["SK"] = "DETAILS"
        courses_table.put_item(Item=item)
        return generate_response(201, {"course_id": data["id"]}, debug)
    except Exception as e:
        return generate_error_response(e, debug)

def handle_drafts(event, method, debug):
    """Handles draft-related API requests."""
    if method == "GET":
        return get_latest_draft(debug)
    if method == "POST":
        return process_request_body(event, create_draft, debug)
    return generate_response(405, {"error": "Method Not Allowed"}, debug)

def get_latest_draft(debug=False):
    """Retrieves the most recent draft from DynamoDB."""
    try:
        response = drafts_table.query(
            KeyConditionExpression=Key('PK').begins_with('DRAFT#'),
            ScanIndexForward=False,
            Limit=1
        )
        drafts = deserialize_items(response.get("Items", []))
        return generate_response(200, drafts[0] if drafts else {}, debug)
    except Exception as e:
        return generate_error_response(e, debug)

def create_draft(body, debug=False):
    """Creates a new draft."""
    try:
        log_debug("Received body", body, debug)

        # ✅ Ensure required fields exist
        required_fields = ["description", "foursomes", "teamOne", "teamTwo"]
        missing_fields = [field for field in required_fields if field not in body]

        if missing_fields:
            return generate_response(400, {"error": f"Missing required fields: {', '.join(missing_fields)}"}, debug)

        draft_id = f"DRAFT#{int(time.time())}"
        item = {
            "PK": draft_id,
            "SK": "DETAILS",
            "description": body["description"],
            "teamOne": body["teamOne"],
            "teamTwo": body["teamTwo"],
            "foursomes": body["foursomes"]
        }

        log_debug("DynamoDB Item to Insert", item, debug)
        drafts_table.put_item(Item=item)
        return generate_response(201, {"draft_id": draft_id}, debug)

    except Exception as e:
        return generate_error_response(e, debug)

def process_request_body(event, handler, debug):
    """Safely processes JSON request body and calls the appropriate handler."""
    try:
        if "body" not in event or not event["body"]:
            return generate_response(400, {"error": "Missing request body"}, debug)
        body = json.loads(event["body"])
        return handler(body, debug)
    except json.JSONDecodeError:
        return generate_response(400, {"error": "Invalid JSON format"}, debug)

def deserialize_items(items) -> List[Dict]:
    """Deserializes DynamoDB items into JSON-compatible format."""
    return [{k: convert_decimals(v) for k, v in item.items()} for item in items]

def generate_response(status_code, body, debug=False):
    """Formats API Gateway-compatible responses."""
    response = {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Credentials": "true"
        },
        "body": json.dumps(body)
    }
    log_debug("Response", response, debug)
    return response

def generate_error_response(exception, debug=False):
    """Handles error responses and logs stack traces."""
    error_details = {"error": str(exception), "traceback": traceback.format_exc()}
    log_debug("ERROR OCCURRED", error_details, debug)
    return generate_response(500, {"error": "Internal Server Error", "details": error_details}, debug)

def log_debug(message, data, debug):
    """Logs debug information when enabled."""
    if debug:
        print(f"DEBUG: {message}: {json.dumps(data, indent=2)}")

def convert_decimals(obj):
    """Converts DynamoDB decimals to integers or floats."""
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    if isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    if isinstance(obj, decimal.Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj
