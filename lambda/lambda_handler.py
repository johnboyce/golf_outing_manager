import json
import boto3
import time
import traceback
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
        if debug:
            print("DEBUG MODE ENABLED")
            print("Received Event:", json.dumps(event, indent=2))

        path = event.get("rawPath", "")
        method = event.get("requestContext", {}).get("http", {}).get("method", "")

        if method == "OPTIONS":
            return generate_response(200, "", debug)

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
        return generate_error_response(e, debug)

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

def deserialize_items(items) -> List[Dict]:
    deserialized = []
    for item in items:
        deserialized.append({key: deserializer.deserialize(value) if isinstance(value, dict) else value for key, value in item.items()})
    return deserialized

def generate_response(status_code, body, debug=False):
    response_body = body if isinstance(body, str) else json.dumps(body)
    response = {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
            "Access-Control-Allow-Headers": "Content-Type,Authorization"
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
