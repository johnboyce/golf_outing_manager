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

output "api_gateway_url" {
  value = aws_apigatewayv2_api.golf_outing_api.api_endpoint
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.golf_outing_distribution.id
}
