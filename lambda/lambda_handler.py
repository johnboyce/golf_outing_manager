import json
import boto3
import time
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
    path = event.get("rawPath", "")
    method = event.get("requestContext", {}).get("http", {}).get("method", "")

    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            "body": ""
        }

    routes = {
        "/players": handle_players,
        "/courses": handle_courses,
        "/drafts": handle_drafts
    }

    for route, handler in routes.items():
        if path.startswith(route):
            response = handler(event, method)
            break
    else:
        response = {"statusCode": 404, "body": json.dumps({"error": "Not Found"})}

    response["headers"] = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
    }
    return response

def handle_players(event, method):
    if method == "GET":
        return get_players()
    if method == "POST":
        body = json.loads(event["body"])
        return create_player(body)
    return {"statusCode": 405, "body": json.dumps({"error": "Method Not Allowed"})}

def handle_courses(event, method):
    if method == "GET":
        return get_courses()
    if method == "POST":
        body = json.loads(event["body"])
        return create_course(body)
    return {"statusCode": 405, "body": json.dumps({"error": "Method Not Allowed"})}

def handle_drafts(event, method):
    if method == "GET":
        return get_latest_draft()
    if method == "POST":
        body = json.loads(event["body"])
        return create_draft(body)
    return {"statusCode": 405, "body": json.dumps({"error": "Method Not Allowed"})}

def create_player(data: Dict):
    item = {key: serializer.serialize(value) for key, value in data.items()}
    item["PK"] = serializer.serialize(f"PLAYER#{data['id']}")
    item["SK"] = serializer.serialize("DETAILS")
    players_table.put_item(Item=item)
    return {"statusCode": 201, "body": json.dumps({"player_id": data["id"]})}

def get_players():
    response = players_table.query(
        KeyConditionExpression=Key("PK").begins_with("PLAYER#")
    )
    players = [{key: deserializer.deserialize(value) for key, value in item.items()} for item in response.get("Items", [])]
    return {"statusCode": 200, "body": json.dumps(players)}

def create_course(data: Dict):
    item = {key: serializer.serialize(value) for key, value in data.items()}
    item["PK"] = serializer.serialize(f"COURSE#{data['id']}")
    item["SK"] = serializer.serialize("DETAILS")
    courses_table.put_item(Item=item)
    return {"statusCode": 201, "body": json.dumps({"course_id": data["id"]})}

def get_courses():
    response = courses_table.query(
        KeyConditionExpression=Key("PK").begins_with("COURSE#")
    )
    courses = [{key: deserializer.deserialize(value) for key, value in item.items()} for item in response.get("Items", [])]
    return {"statusCode": 200, "body": json.dumps(courses)}

def create_draft(data: Dict):
    timestamp = int(time.time())
    draft_id = f"DRAFT#{timestamp}"
    item = {
        "PK": serializer.serialize(draft_id),
        "SK": serializer.serialize("DETAILS"),
        "description": serializer.serialize(data.get("description", "")),
        "players": serializer.serialize(data.get("players", [])),
        "foursomes": serializer.serialize([])
    }
    drafts_table.put_item(Item=item)
    return {"statusCode": 201, "body": json.dumps({"draft_id": draft_id})}

def get_latest_draft():
    response = drafts_table.query(
        KeyConditionExpression=Key("PK").begins_with("DRAFT#"),
        ScanIndexForward=False,  # Get the latest draft first
        Limit=1  # Only fetch the most recent item
    )
    latest_draft = {key: deserializer.deserialize(value) for key, value in response.get("Items", [])[0].items()} if response.get("Items", []) else {}
    return {"statusCode": 200, "body": json.dumps(latest_draft)}
