#!/bin/bash

# Test the intake API endpoint
echo "Testing the intake API with the new Patient attributes..."
echo ""

curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d @test-request-body.json \
  -w "\n\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  | jq '.'

echo ""
echo "Test completed!"
