import json
import boto3
import time
import traceback
import decimal
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.types import TypeDeserializer, TypeSerializer
from typing import List, Dict

dynamodb = boto3.resource("dynamodb")
players_table = dynamodb.Table("GolfOutingPlayersTable")
courses_table = dynamodb.Table("GolfOutingCoursesTable")
drafts_table = dynamodb.Table("GolfOutingDraftsTable")

deserializer = TypeDeserializer()
serializer = TypeSerializer()

def lambda_handler(event, context):
    debug = event.get("queryStringParameters", {}).get("debug", "false").lower() == "true"

    try:
        print("DEBUG: Received full event:", json.dumps(event, indent=2))  # ✅ Log entire event

        if debug:
            print("DEBUG MODE ENABLED")
            print("Received Event:", json.dumps(event, indent=2))

        path = event.get("rawPath", "")
        method = event.get("requestContext", {}).get("http", {}).get("method", "")

        if method == "OPTIONS":
            return generate_response(200, {"message": "CORS preflight successful"}, debug)

        routes = {
            "/players": handle_players,
            "/courses": handle_courses,
            "/drafts": handle_drafts
        }

        for route, handler in routes.items():
            if path.startswith(route):
                response = handler(event, method, debug)
                break
        else:
            response = generate_response(404, {"error": "Not Found"}, debug)

    except Exception as e:
        response = generate_error_response(e, debug)

    return response

def handle_players(event, method, debug):
    if method == "GET":
        return get_players(debug)
    if method == "POST":
        body = json.loads(event["body"])
        return create_player(body, debug)
    return generate_response(405, {"error": "Method Not Allowed"}, debug)

def get_players(debug=False):
    try:
        response = players_table.scan()
        players = deserialize_items(response.get("Items", []))
        return generate_response(200, players, debug)
    except Exception as e:
        return generate_error_response(e, debug)

def create_player(data, debug=False):
    try:
        item = serialize_item(data)
        item["PK"] = f"PLAYER#{data['id']}"
        item["SK"] = "DETAILS"
        players_table.put_item(Item=item)
        return generate_response(201, {"player_id": data["id"]}, debug)
    except Exception as e:
        return generate_error_response(e, debug)

def handle_courses(event, method, debug):
    if method == "GET":
        return get_courses(debug)
    if method == "POST":
        body = json.loads(event["body"])
        return create_course(body, debug)
    return generate_response(405, {"error": "Method Not Allowed"}, debug)

def get_courses(debug=False):
    try:
        response = courses_table.scan()
        courses = deserialize_items(response.get("Items", []))
        return generate_response(200, courses, debug)
    except Exception as e:
        return generate_error_response(e, debug)

def create_course(data, debug=False):
    try:
        item = serialize_item(data)
        item["PK"] = f"COURSE#{data['id']}"
        item["SK"] = "DETAILS"
        courses_table.put_item(Item=item)
        return generate_response(201, {"course_id": data["id"]}, debug)
    except Exception as e:
        return generate_error_response(e, debug)

def handle_drafts(event, method, debug):
    if method == "GET":
        return get_latest_draft(debug)
    if method == "POST":
        print("DEBUG: Raw event body before parsing:", event["body"])  # ✅ Print the raw request body
        try:
            body = json.loads(event["body"])
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {str(e)}")
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON"})}

        body = json.loads(event["body"])
        return create_draft(body, debug)
    return generate_response(405, {"error": "Method Not Allowed"}, debug)

def get_latest_draft(debug=False):
    try:
        response = drafts_table.scan()
        drafts = deserialize_items(response.get("Items", []))
        return generate_response(200, drafts, debug)
    except Exception as e:
        return generate_error_response(e, debug)

def create_draft(body, debug=False):  # Renamed "event" to "body"
    try:
        print("Received body:", json.dumps(body))  # ✅ Log full body

        # ✅ Ensure request body is present
        if not body:  # No need to check "body" key, "body" is already parsed
            return generate_response(400, {"error": "Missing request body"}, debug)

        print("Parsed body:", json.dumps(body))  # ✅ Debug parsed body

        # ✅ Validate required fields
        if "description" not in body or "players" not in body:
            return generate_response(400, {"error": "Missing required fields: 'description' and 'players'"}, debug)

        timestamp = int(time.time())
        draft_id = f"DRAFT#{timestamp}"

        item = {
            "PK": draft_id,
            "SK": "DETAILS",
            "description": body.get("description", ""),
            "players": body.get("players", []),
            "foursomes": []
        }
        print("DynamoDB Item to Insert:", json.dumps(item))  # ✅ Debug item before insertion

        # ✅ Insert into DynamoDB
        drafts_table.put_item(Item=item)

        return generate_response(201, {"draft_id": draft_id}, debug)

    except json.JSONDecodeError:
        print("JSON Decode Error")  # ✅ Log JSON errors
        return generate_response(400, {"error": "Invalid JSON format"}, debug)
    except Exception as e:
        print("ERROR:", traceback.format_exc())  # ✅ Print full error traceback
        return generate_error_response(e, debug)


def deserialize_items(items) -> List[Dict]:
    deserialized = []
    for item in items:
        deserialized.append({k: convert_decimals(v) for k, v in item.items()})
    return deserialized

def generate_response(status_code, body, debug=False):
    response_body = body if isinstance(body, str) else json.dumps(convert_decimals(body))
    response = {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",  # Allow all origins
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Credentials": "true"
        },
        "body": response_body
    }
    if debug:
        print("Response:", json.dumps(response, indent=2))
    return response

def generate_error_response(exception, debug=False):
    error_details = {
        "error": str(exception),
        "traceback": traceback.format_exc()
    }
    print("ERROR OCCURRED:", json.dumps(error_details, indent=2))
    return generate_response(500, {"error": "Internal Server Error", "debug_info": error_details}, debug)

def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, decimal.Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj
