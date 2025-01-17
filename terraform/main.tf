# Terraform configuration for Golf Outing Manager

provider "aws" {
  region = "us-east-1"
}

# S3 Bucket for Terraform State
resource "aws_s3_bucket" "terraform_state_bucket" {
  bucket        = "golf-outing-terraform-state"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "terraform_state_versioning" {
  bucket = aws_s3_bucket.terraform_state_bucket.bucket

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_encryption" {
  bucket = aws_s3_bucket.terraform_state_bucket.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Configure Terraform Backend to Use S3
terraform {
  backend "s3" {
    bucket         = aws_s3_bucket.terraform_state_bucket.bucket
    key            = "terraform/state"
    region         = "us-east-1"
    encrypt        = true
  }
}

# S3 Bucket for Static Website Hosting
resource "aws_s3_bucket" "golf_outing_bucket" {
  bucket        = "golf-outing-manager"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.golf_outing_bucket.bucket

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.golf_outing_bucket.bucket
  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "website_config" {
  bucket = aws_s3_bucket.golf_outing_bucket.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_policy" "golf_outing_policy" {
  bucket = aws_s3_bucket.golf_outing_bucket.bucket

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
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
  api_id      = aws_apigatewayv2_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.golf_outing_lambda.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.execution_arn}/*"
}

resource "aws_apigatewayv2_integration" "golf_outing_integration" {
  api_id           = aws_apigatewayv2_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.golf_outing_lambda.arn
}

resource "aws_apigatewayv2_route" "golf_outing_route" {
  api_id    = aws_apigatewayv2_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.id}"
}

# Terraform Output for S3 Bucket Name
output "s3_bucket_name" {
  value = aws_s3_bucket.golf_outing_bucket.bucket
}

output "s3_bucket_website_url" {
  value = aws_s3_bucket.golf_outing_bucket.website_endpoint
}

output "api_gateway_url" {
  value = aws_apigatewayv2_api.golf_outing_api.api_endpoint
}
