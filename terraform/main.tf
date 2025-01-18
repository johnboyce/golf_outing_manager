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

resource "aws_s3_bucket_versioning" "golf_outing_versioning" {
  bucket = aws_s3_bucket.golf_outing_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "block_public_access" {
  bucket                  = aws_s3_bucket.golf_outing_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_identity" "golf_outing_oai" {
  comment = "OAI for Golf Outing CloudFront"
}

resource "aws_s3_bucket_policy" "golf_outing_policy" {
  bucket = aws_s3_bucket.golf_outing_bucket.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess",
        Effect    = "Allow",
        Principal = {
          Service = "cloudfront.amazonaws.com"
        },
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.golf_outing_bucket.arn}/*",
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.golf_outing_distribution.arn
          }
        }
      }
    ]
  })
}

# S3 Bucket for Lambda Deployment
resource "aws_s3_bucket" "lambda_deployment_bucket" {
  bucket        = "golf-outing-lambda-deployments"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "lambda_access_block" {
  bucket                  = aws_s3_bucket.lambda_deployment_bucket.bucket
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "null_resource" "setup_npmrc" {
  provisioner "local-exec" {
    command = <<EOT
    echo "Before setting up .npmrc:"
    ls -la ../lambda
    if [ ! -f "../lambda/.npmrc" ]; then
      echo "production=true" > ../lambda/.npmrc;
      echo "package-lock=false" >> ../lambda/.npmrc;
      echo "save-exact=true" >> ../lambda/.npmrc;
      echo "omit=dev" >> ../lambda/.npmrc;
      echo ".npmrc file created successfully.";
    else
      echo ".npmrc file already exists.";
    fi
    echo "After setting up .npmrc:"
    ls -la ../lambda
    EOT
  }
}

resource "null_resource" "setup_lambda_environment" {
  provisioner "local-exec" {
    command = <<EOT
    echo "Before setting up Lambda environment:"
    ls -la ../lambda
    if [ ! -d "../lambda" ]; then
      echo "Error: Lambda source directory '../lambda' does not exist!";
      exit 1;
    fi
    cd ../lambda
    if [ ! -f "package.json" ]; then
      npm init -y
      echo "Initialized package.json."
    fi
    npm install @aws-sdk/client-dynamodb --save
    echo "Installed @aws-sdk/client-dynamodb."
    cd -
    echo "After setting up Lambda environment:"
    ls -la ../lambda
    EOT
  }

  triggers = {
    last_updated = timestamp()
  }

  depends_on = [
    null_resource.setup_npmrc
  ]
}

resource "null_resource" "package_lambda" {
  provisioner "local-exec" {
    command = <<EOT
    echo "Packaging Lambda..."
    cd ../lambda
    npm install --production
    zip -r ../lambda.zip . -x "*.git*" "*.md" "test/*" "../lambda.zip" "lambda.zip"|| { echo "Error creating Lambda package"; exit 1; }
    echo "Lambda package created successfully at ../lambda.zip."
    ls -la ../lambda.zip
    EOT
  }


  triggers = {
    last_updated = timestamp() # Updates the zip file on every `apply`
  }

  depends_on = [
    null_resource.setup_lambda_environment
  ]
}

resource "aws_s3_object" "lambda_zip" {
  bucket = aws_s3_bucket.lambda_deployment_bucket.bucket
  key    = "lambda.zip"
  source = "../lambda.zip"

  depends_on = [
    null_resource.package_lambda
  ]
}

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

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.golf_outing_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_access" {
  role       = aws_iam_role.golf_outing_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_lambda_function" "golf_outing_lambda" {
  function_name = "GolfOutingHandler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.golf_outing_lambda_role.arn
  handler       = "index.handler"
  s3_bucket     = aws_s3_bucket.lambda_deployment_bucket.bucket
  s3_key        = aws_s3_object.lambda_zip.key

  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.golf_outing_table.name
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy_attachment.lambda_dynamodb_access,
    aws_s3_object.lambda_zip
  ]
}

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

    min_ttl                = 300
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

resource "aws_apigatewayv2_api" "golf_outing_api" {
  name          = "GolfOutingAPI"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "golf_outing_integration" {
  api_id                 = aws_apigatewayv2_api.golf_outing_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.golf_outing_lambda.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_stage" "golf_outing_stage" {
  api_id      = aws_apigatewayv2_api.golf_outing_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_route" "golf_outing_route" {
  api_id    = aws_apigatewayv2_api.golf_outing_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.golf_outing_integration.id}"
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

resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.golf_outing_lambda.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.golf_outing_api.execution_arn}/*"
}