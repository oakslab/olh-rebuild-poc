#!/bin/bash

# Test the intake API with weight and height observations
echo "Testing the intake API with weight and height Observation resources..."
echo ""

curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d @test-request.json \
  -w "\n\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  | jq '.'

echo ""
echo "Test completed! Check the console logs to see the FHIR bundle with:"
echo "- 1 Patient resource"
echo "- 2 Observation resources (weight: LOINC 29463-7, height: LOINC 8302-2)"
