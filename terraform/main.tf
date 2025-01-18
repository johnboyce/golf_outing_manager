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

resource "aws_cloudfront_origin_access_identity" "golf_outing_oai" {
  comment = "Origin Access Identity for Golf Outing"
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
            "AWS:SourceArn" = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/*"
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
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "null_resource" "package_lambda" {
  provisioner "local-exec" {
    command = <<EOT
    if [ ! -d "../lambda" ]; then
      echo "Error: Lambda source directory '../lambda' does not exist!";
      exit 1;
    fi
    zip -r ./lambda.zip ../lambda || { echo "Error creating Lambda package"; exit 1; }
    echo "Lambda package created successfully.";
    ls -la ./lambda.zip
    EOT
  }

  triggers = {
    last_updated = timestamp() # Updates the zip file on every `apply`
  }
}

resource "aws_s3_object" "lambda_zip" {
  bucket = aws_s3_bucket.lambda_deployment_bucket.bucket
  key    = "lambda.zip"
  source = "${path.module}/lambda.zip"

  depends_on = [
    null_resource.package_lambda
  ]
}

resource "aws_iam_policy" "lambda_s3_access" {
  name = "LambdaS3AccessPolicy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        Effect   = "Allow",
        Resource = [
          aws_s3_bucket.lambda_deployment_bucket.arn,
          "${aws_s3_bucket.lambda_deployment_bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_s3_bucket_policy" "lambda_deployment_bucket_policy" {
  bucket = aws_s3_bucket.lambda_deployment_bucket.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowLambdaAccess",
        Effect    = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.lambda_deployment_bucket.arn}/*"
      }
    ]
  })
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

data "aws_caller_identity" "current" {}

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

# Terraform Outputs
output "s3_bucket_name" {
  value = aws_s3_bucket.lambda_deployment_bucket.bucket
}

output "s3_key" {
  value = aws_s3_object.lambda_zip.key
}

output "s3_bucket_website_url" {
  value = aws_cloudfront_distribution.golf_outing_distribution.domain_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.golf_outing_distribution.id
}

output "cloudfront_distribution_domain_name" {
  value = aws_cloudfront_distribution.golf_outing_distribution.domain_name
}
