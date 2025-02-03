#!/bin/bash
echo "Packaging Python Lambda..."

# Ensure we're in the correct directory (remove unnecessary cd lambda)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Create a clean package directory
rm -rf package
mkdir package

# Install dependencies using pip if available, otherwise fallback to pip3
if command -v pip &>/dev/null; then
    pip install -r requirements.txt -t package
elif command -v pip3 &>/dev/null; then
    pip3 install -r requirements.txt -t package
else
    echo "Error: Neither pip nor pip3 found!" >&2
    exit 1
fi

# Copy the Lambda handler file
cp lambda_handler.py package/

# Create the zip package
cd package || exit 1
zip -r ../lambda.zip .

echo "Lambda package created successfully."
