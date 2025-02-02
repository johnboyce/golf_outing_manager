#!/bin/bash
echo "Packaging Python Lambda..."

# Ensure we're in the correct directory (remove unnecessary cd lambda)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Create a clean package directory
rm -rf package
mkdir package

# Install dependencies
pip install -r requirements.txt -t package

# Copy the Lambda handler file
cp lambda_handler.py package/

# Create the zip package
cd package || exit 1
zip -r ../lambda.zip .

echo "Lambda package created successfully."
