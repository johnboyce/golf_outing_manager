import json
import boto3
import time
from typing import List, Dict

dynamodb = boto3.client("dynamodb")
DYNAMODB_PLAYERS_TABLE = "GolfOutingPlayersTable"
DYNAMODB_COURSES_TABLE = "GolfOutingCoursesTable"
DYNAMODB_DRAFTS_TABLE = "GolfOutingDraftsTable"

def lambda_handler(event, context):
    path = event["rawPath"]
    method = event["requestContext"]["http"]["method"]

    if path.startswith("/players"):
        response = handle_players(event, method)
    elif path.startswith("/courses"):
        response = handle_courses(event, method)
    elif path.startswith("/drafts"):
        response = handle_drafts(event, method)
    else:
        response = {"statusCode": 404, "body": json.dumps({"error": "Not Found"})}

    # Add CORS headers to all responses
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
        return create_player(body["id"], body["name"], body["nickname"], body["handicap"], body["bio"], body["prediction"], body["profileImage"], body["teamLogo"])
    return {"statusCode": 405, "body": json.dumps({"error": "Method Not Allowed"})}

def handle_courses(event, method):
    if method == "GET":
        return get_courses()
    if method == "POST":
        body = json.loads(event["body"])
        return create_course(body["id"], body["name"], body["image"], body["description"])
    return {"statusCode": 405, "body": json.dumps({"error": "Method Not Allowed"})}

def handle_drafts(event, method):
    if method == "GET":
        return get_latest_draft()
    if method == "POST":
        body = json.loads(event["body"])
        return create_draft(body.get("players", []), body.get("description", ""))
    return {"statusCode": 405, "body": json.dumps({"error": "Method Not Allowed"})}

def create_player(player_id: str, name: str, nickname: str, handicap: int, bio: str, prediction: str, profile_image: str, team_logo: str):
    item = {
        "PK": {"S": f"PLAYER#{player_id}"},
        "SK": {"S": "DETAILS"},
        "name": {"S": name},
        "nickname": {"S": nickname},
        "handicap": {"N": str(handicap)},
        "bio": {"S": bio},
        "prediction": {"S": prediction},
        "profileImage": {"S": profile_image},
        "teamLogo": {"S": team_logo}
    }
    dynamodb.put_item(TableName=DYNAMODB_PLAYERS_TABLE, Item=item)
    return {"statusCode": 201, "body": json.dumps({"player_id": player_id})}

def get_players():
    response = dynamodb.scan(TableName=DYNAMODB_PLAYERS_TABLE)
    return {"statusCode": 200, "body": json.dumps(response.get("Items", []))}

def create_course(course_id: str, name: str, image: str, description: str):
    item = {
        "PK": {"S": f"COURSE#{course_id}"},
        "SK": {"S": "DETAILS"},
        "name": {"S": name},
        "image": {"S": image},
        "description": {"S": description}
    }
    dynamodb.put_item(TableName=DYNAMODB_COURSES_TABLE, Item=item)
    return {"statusCode": 201, "body": json.dumps({"course_id": course_id})}

def get_courses():
    response = dynamodb.scan(TableName=DYNAMODB_COURSES_TABLE)
    return {"statusCode": 200, "body": json.dumps(response.get("Items", []))}

def create_draft(players: List[str], description: str):
    timestamp = int(time.time())
    draft_id = f"DRAFT#{timestamp}"
    item = {
        "PK": {"S": draft_id},
        "SK": {"S": "DETAILS"},
        "description": {"S": description},
        "players": {"S": json.dumps(players)},
        "foursomes": {"S": "[]"}
    }
    dynamodb.put_item(TableName=DYNAMODB_DRAFTS_TABLE, Item=item)
    return {"statusCode": 201, "body": json.dumps({"draft_id": draft_id})}

def get_latest_draft():
    response = dynamodb.scan(
        TableName=DYNAMODB_DRAFTS_TABLE,
        FilterExpression="begins_with(PK, :prefix)",
        ExpressionAttributeValues={":prefix": {"S": "DRAFT#"}}
    )
    items = sorted(response.get("Items", []), key=lambda x: x["PK"]["S"], reverse=True)
    latest_draft = items[0] if items else {}
    return {"statusCode": 200, "body": json.dumps(latest_draft)}
