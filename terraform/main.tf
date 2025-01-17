# Terraform configuration for Golf Outing Manager

provider "aws" {
  region = "us-east-1"
}

# S3 Bucket for Static Website Hosting
resource "aws_s3_bucket" "golf_outing_bucket" {
  bucket        = "golf-outing-manager-${random_id.suffix.hex}"
  acl           = "public-read"
  force_destroy = true

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket_policy" "golf_outing_policy" {
  bucket = aws_s3_bucket.golf_outing_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.golf_outing_bucket.arn}/*"
      }
    ]
  })
}

# DynamoDB Table for Data Persistence
resource "aws_dynamodb_table" "golf_outing_table" {
  name           = "GolfOutingTable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

# Lambda Function for Backend
resource "aws_lambda_function" "golf_outing_lambda" {
  function_name = "GolfOutingHandler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.golf_outing_lambda_role.arn
  handler       = "index.handler"
  filename      = "${path.module}/lambda.zip"

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.golf_outing_table.name
    }
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "golf_outing_lambda_role" {
  name               = "golf_outing_lambda_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.golf_outing_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_access" {
  role       = aws_iam_role.golf_outing_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# API Gateway for Backend
resource "aws_apigatewayv2_api" "golf_outing_api" {
  name          = "GolfOutingAPI"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "golf_outing_stage" {
  api_id      = aws_apigatewayv2_api.golf_outing_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.golf_outing_lambda.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.golf_outing_api.execution_arn}/*"
}

resource "aws_apigatewayv2_integration" "golf_outing_integration" {
  api_id           = aws_apigatewayv2_api.golf_outing_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.golf_outing_lambda.arn
}

resource "aws_apigatewayv2_route" "golf_outing_route" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

# Random Suffix for Unique Resource Naming
resource "random_id" "suffix" {
  byte_length = 4
}

output "s3_bucket_website_url" {
  value = aws_s3_bucket.golf_outing_bucket.website_endpoint
}

output "api_gateway_url" {
  value = aws_apigatewayv2_api.golf_outing_api.api_endpoint
}
