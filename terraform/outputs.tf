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

output "cloudfront_url" {
  description = "The CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.golf_outing_distribution.domain_name
}

output "api_gateway_base_url" {
  description = "Base URL for the API Gateway"
  value       = aws_apigatewayv2_api.golf_outing_api.api_endpoint
}

output "players_endpoint" {
  description = "Endpoint for managing players"
  value       = "${aws_apigatewayv2_api.golf_outing_api.api_endpoint}/players"
}

output "courses_endpoint" {
  description = "Endpoint for managing courses"
  value       = "${aws_apigatewayv2_api.golf_outing_api.api_endpoint}/courses"
}

output "drafts_endpoint" {
  description = "Endpoint for managing drafts"
  value       = "${aws_apigatewayv2_api.golf_outing_api.api_endpoint}/drafts"
}

output "get_latest_draft_endpoint" {
  description = "Endpoint to get the latest draft"
  value       = "${aws_apigatewayv2_api.golf_outing_api.api_endpoint}/drafts/latest"
}

output "regenerate_foursomes_endpoint" {
  description = "Endpoint to regenerate foursomes for a draft"
  value       = "${aws_apigatewayv2_api.golf_outing_api.api_endpoint}/drafts/{draftId}/regenerate"
}

output "finalize_draft_endpoint" {
  description = "Endpoint to finalize a draft"
  value       = "${aws_apigatewayv2_api.golf_outing_api.api_endpoint}/drafts/{draftId}/finalize"
}
