# AWS Provider
provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket         = "golf-outing-terraform-state"
    key            = "terraform/state"
    region         = "us-east-1"
    encrypt        = true
  }
}

# ✅ S3 Bucket for Hosting Golf Outing Assets
resource "aws_s3_bucket" "golf_outing_bucket" {
  bucket = "golf-outing-manager"

  lifecycle {
    prevent_destroy = false
  }

  tags = {
    Name        = "Golf Outing Manager"
    Environment = "Production"
  }
}

# ✅ Enable Versioning for S3 Bucket
resource "aws_s3_bucket_versioning" "golf_outing_versioning" {
  bucket = aws_s3_bucket.golf_outing_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

# ✅ Block Public Access for S3
resource "aws_s3_bucket_public_access_block" "block_public_access" {
  bucket                  = aws_s3_bucket.golf_outing_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ✅ CloudFront Origin Access Identity (OAI)
resource "aws_cloudfront_origin_access_identity" "golf_outing_oai" {
  comment = "OAI for Golf Outing CloudFront"
}

# ✅ CloudFront Distribution for S3
resource "aws_cloudfront_distribution" "golf_outing_distribution" {
  origin {
    domain_name = aws_s3_bucket.golf_outing_bucket.bucket_regional_domain_name
    origin_id   = "golf-outing-origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.golf_outing_oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    target_origin_id       = "golf-outing-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "Golf Outing Distribution"
  }
}

# ✅ S3 Bucket Policy to Allow CloudFront Access
resource "aws_s3_bucket_policy" "golf_outing_policy" {
  bucket = aws_s3_bucket.golf_outing_bucket.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess",
        Effect    = "Allow",
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.golf_outing_oai.iam_arn
        },
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.golf_outing_bucket.arn}/*"
      }
    ]
  })
}

# ✅ API Gateway REST API for Golf Outing
resource "aws_apigatewayv2_api" "golf_outing_api" {
  name          = "GolfOutingAPI"
  protocol_type = "HTTP"
}

# Create API Gateway Lambda Integration
resource "aws_apigatewayv2_integration" "golf_outing_integration" {
  api_id                 = aws_apigatewayv2_api.golf_outing_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.golf_outing_lambda.invoke_arn
  payload_format_version = "2.0"
}

# Define Routes for Players API
resource "aws_apigatewayv2_route" "players_list" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "GET /players"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

resource "aws_apigatewayv2_route" "player_get" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "GET /players/{playerId}"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

resource "aws_apigatewayv2_route" "player_add" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "POST /players"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

resource "aws_apigatewayv2_route" "player_update" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "PUT /players/{playerId}"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

resource "aws_apigatewayv2_route" "player_delete" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "DELETE /players/{playerId}"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

# Define Routes for Courses API
resource "aws_apigatewayv2_route" "courses_list" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "GET /courses"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

resource "aws_apigatewayv2_route" "course_get" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "GET /courses/{courseId}"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

resource "aws_apigatewayv2_route" "course_add" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "POST /courses"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

resource "aws_apigatewayv2_route" "course_update" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "PUT /courses/{courseId}"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

resource "aws_apigatewayv2_route" "course_delete" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "DELETE /courses/{courseId}"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
}

# Deploy API Gateway
resource "aws_apigatewayv2_stage" "golf_outing_stage" {
  api_id      = aws_apigatewayv2_api.golf_outing_api.id
  name        = "$default"   # Use "$default" for HTTP API to enable auto-deploy
  auto_deploy = true         # Enables automatic deployment on route changes

  default_route_settings {
    throttling_rate_limit  = 10   # Limit requests per second
    throttling_burst_limit = 10    # Burst limit
  }
}

# Allow API Gateway to invoke Lambda
resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.golf_outing_lambda.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.golf_outing_api.execution_arn}/*"
}

# ✅ CloudWatch Logs for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/api-gateway/golf-outing-api"
  retention_in_days = 3
}

# ✅ S3 Bucket for Lambda Deployment
resource "aws_s3_bucket" "lambda_deployment_bucket" {
  bucket        = "golf-outing-lambda-deployments"
  force_destroy = true
}

# ✅ Block Public Access for Lambda Deployment S3
resource "aws_s3_bucket_public_access_block" "lambda_access_block" {
  bucket                  = aws_s3_bucket.lambda_deployment_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


# ✅ Package Lambda Before Uploading to S3
resource "null_resource" "package_lambda" {
  provisioner "local-exec" {
    command = <<EOT
    echo "Packaging Python Lambda..."

    SCRIPT_DIR="${path.module}/../lambda"

    if [ ! -d "$SCRIPT_DIR" ]; then
      echo "Error: Lambda directory not found!" >&2
      exit 1
    fi

    cd "$SCRIPT_DIR"

    # Create a clean package directory
    rm -rf package
    mkdir package

    # Install dependencies
    pip install -r requirements.txt -t package

    # Copy the Lambda handler file
    cp lambda_handler.py package/

    # Create the zip package
    cd package
    zip -r ../lambda.zip .

    echo "Lambda package created successfully."
    EOT
  }

  triggers = {
    lambda_src_hash = filemd5("${path.module}/../lambda/lambda_handler.py")
  }
}


# ✅ Upload Packaged Lambda ZIP to S3
resource "aws_s3_object" "lambda_zip" {
  bucket = aws_s3_bucket.lambda_deployment_bucket.bucket
  key    = "lambda/lambda.zip"
  source = "../lambda/lambda.zip"

  # Ensures Terraform detects changes when lambda_handler.py is modified
  etag   = fileexists("../lambda/lambda.zip") ? filemd5("../lambda/lambda.zip") : null  # Ensures Terraform handles missing/changed file gracefully

  depends_on = [
    null_resource.package_lambda # Ensures zip file is created first
  ]
}

# ✅ IAM Role for Lambda Function
resource "aws_iam_role" "golf_outing_lambda_role" {
  name               = "GolfOutingLambdaRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# ✅ Attach IAM Policies to Lambda Role
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.golf_outing_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_access" {
  role       = aws_iam_role.golf_outing_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# ✅ Lambda Function
resource "aws_lambda_function" "golf_outing_lambda" {
  function_name = "GolfOutingHandler"
  runtime       = "python3.9"
  role          = aws_iam_role.golf_outing_lambda_role.arn
  handler       = "lambda_handler.lambda_handler"
  s3_bucket     = aws_s3_bucket.lambda_deployment_bucket.id
  s3_key        = aws_s3_object.lambda_zip.key

  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      DYNAMODB_PLAYERS_TABLE = "GolfOutingPlayersTable"
      DYNAMODB_COURSES_TABLE = "GolfOutingCoursesTable"
      DYNAMODB_DRAFTS_TABLE  = "GolfOutingDraftsTable"
    }
  }

  # Prevents Terraform failure if lambda.zip does not exist yet
  source_code_hash = fileexists("../lambda/lambda.zip") ? filebase64sha256("../lambda/lambda.zip") : null

  depends_on = [
    aws_s3_object.lambda_zip
  ]
}

# Lambda Function: Create Draft
resource "aws_lambda_function" "create_draft_lambda" {
  function_name = "create_draft_lambda"
  runtime       = "python3.9"
  role          = aws_iam_role.golf_outing_lambda_role.arn
  handler       = "lambda.create_draft"
  s3_bucket     = aws_s3_bucket.lambda_deployment_bucket.id
  s3_key        = aws_s3_object.lambda_zip.key

  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      DYNAMODB_TABLE = "GolfOutingDraftsTable"
    }
  }

  # Prevents Terraform failure if lambda.zip does not exist yet
  source_code_hash = fileexists("../lambda/lambda.zip") ? filebase64sha256("../lambda/lambda.zip") : null

}

# Lambda Function: Get Latest Draft
resource "aws_lambda_function" "get_latest_draft_lambda" {
  function_name = "get_latest_draft_lambda"
  runtime       = "python3.9"
  role          = aws_iam_role.golf_outing_lambda_role.arn
  handler       = "lambda.get_latest_draft"
  s3_bucket     = aws_s3_bucket.lambda_deployment_bucket.id
  s3_key        = aws_s3_object.lambda_zip.key

  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      DYNAMODB_TABLE = "GolfOutingDraftsTable"
    }
  }

  # Prevents Terraform failure if lambda.zip does not exist yet
  source_code_hash = fileexists("../lambda/lambda.zip") ? filebase64sha256("../lambda/lambda.zip") : null

}

# Lambda Function: Regenerate Foursomes
resource "aws_lambda_function" "regenerate_foursomes_lambda" {
  function_name = "regenerate_foursomes_lambda"
  runtime       = "python3.9"
  role          = aws_iam_role.golf_outing_lambda_role.arn
  handler       = "lambda.regenerate_foursomes"
  s3_bucket     = aws_s3_bucket.lambda_deployment_bucket.id
  s3_key        = aws_s3_object.lambda_zip.key

  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      DYNAMODB_TABLE = "GolfOutingDraftsTable"
    }
  }

  # Prevents Terraform failure if lambda.zip does not exist yet
  source_code_hash = fileexists("../lambda/lambda.zip") ? filebase64sha256("../lambda/lambda.zip") : null

}

# Lambda Function: Finalize Draft
resource "aws_lambda_function" "finalize_draft_lambda" {
  function_name = "finalize_draft_lambda"
  runtime       = "python3.9"
  role          = aws_iam_role.golf_outing_lambda_role.arn
  handler       = "lambda.finalize_draft"
  s3_bucket     = aws_s3_bucket.lambda_deployment_bucket.id
  s3_key        = aws_s3_object.lambda_zip.key

  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      DYNAMODB_TABLE = "GolfOutingDraftsTable"
    }
  }

  # Prevents Terraform failure if lambda.zip does not exist yet
  source_code_hash = fileexists("../lambda/lambda.zip") ? filebase64sha256("../lambda/lambda.zip") : null

}

# API Gateway Lambda Integration for Drafts
resource "aws_apigatewayv2_integration" "create_draft_integration" {
  api_id                 = aws_apigatewayv2_api.golf_outing_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.create_draft_lambda.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "get_latest_draft_integration" {
  api_id                 = aws_apigatewayv2_api.golf_outing_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.get_latest_draft_lambda.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "regenerate_foursomes_integration" {
  api_id                 = aws_apigatewayv2_api.golf_outing_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.regenerate_foursomes_lambda.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "finalize_draft_integration" {
  api_id                 = aws_apigatewayv2_api.golf_outing_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.finalize_draft_lambda.invoke_arn
  payload_format_version = "2.0"
}


# API Routes for Drafts
resource "aws_apigatewayv2_route" "create_draft" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "POST /drafts"
  target    = "integrations/${aws_apigatewayv2_integration.create_draft_integration.id}"

  depends_on = [
    aws_lambda_function.create_draft_lambda
  ]
}

resource "aws_apigatewayv2_route" "get_latest_draft" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "GET /drafts/latest"
  target    = "integrations/${aws_apigatewayv2_integration.get_latest_draft_integration.id}"

  depends_on = [
    aws_lambda_function.get_latest_draft_lambda
  ]
}

resource "aws_apigatewayv2_route" "regenerate_foursomes" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "POST /drafts/{draftId}/regenerate"
  target    = "integrations/${aws_apigatewayv2_integration.regenerate_foursomes_integration.id}"

  depends_on = [
    aws_lambda_function.regenerate_foursomes_lambda
  ]
}

resource "aws_apigatewayv2_route" "finalize_draft" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "POST /drafts/{draftId}/finalize"
  target    = "integrations/${aws_apigatewayv2_integration.finalize_draft_integration.id}"

  depends_on = [
    aws_lambda_function.finalize_draft_lambda
  ]
}

resource "aws_lambda_permission" "allow_api_gateway_create_draft" {
  statement_id  = "AllowAPIGatewayCreateDraftInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_draft_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.golf_outing_api.execution_arn}/*"
}

resource "aws_lambda_permission" "allow_api_gateway_get_latest_draft" {
  statement_id  = "AllowAPIGatewayGetLatestDraftInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_latest_draft_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.golf_outing_api.execution_arn}/*"
}

resource "aws_lambda_permission" "allow_api_gateway_regenerate_foursomes" {
  statement_id  = "AllowAPIGatewayRegenerateFoursomesInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.regenerate_foursomes_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.golf_outing_api.execution_arn}/*"
}

resource "aws_lambda_permission" "allow_api_gateway_finalize_draft" {
  statement_id  = "AllowAPIGatewayFinalizeDraftInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.finalize_draft_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.golf_outing_api.execution_arn}/*"
}
