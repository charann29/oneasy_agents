# 🚀 Quick Test Commands

Copy and paste these commands to test each endpoint:

## 1. List Business Plans (Fast - <1 second)
```bash
curl -X GET 'http://localhost:3000/api/v1/business-plan/list?limit=10&offset=0' \
  -H 'Authorization: Bearer demo-api-key-12345' | jq
```

## 2. Create Business Plan (Slow - 10-30 seconds)
```bash
curl -X POST http://localhost:3000/api/v1/business-plan/create \
  -H 'Authorization: Bearer demo-api-key-12345' \
  -H 'Content-Type: application/json' \
  -d '{
    "businessName": "TechStartup AI",
    "industry": "SaaS",
    "stage": "startup",
    "targetMarket": "Small businesses",
    "location": "San Francisco, CA",
    "description": "AI automation platform"
  }' | jq
```

## 3. Market Analysis (Medium - 5-15 seconds)
```bash
curl -X POST http://localhost:3000/api/v1/market-analysis \
  -H 'Authorization: Bearer demo-api-key-12345' \
  -H 'Content-Type: application/json' \
  -d '{
    "industry": "SaaS",
    "geography": "United States",
    "targetSegment": "Small businesses"
  }' | jq
```

## 4. Financial Model (Medium - 8-20 seconds)
```bash
curl -X POST http://localhost:3000/api/v1/financial-model \
  -H 'Authorization: Bearer demo-api-key-12345' \
  -H 'Content-Type: application/json' \
  -d '{
    "businessName": "TechStartup AI",
    "industry": "SaaS",
    "stage": "startup"
  }' | jq
```

## 5. Test Authentication (Should Fail)
```bash
curl -X POST http://localhost:3000/api/v1/business-plan/create \
  -H 'Content-Type: application/json' \
  -d '{"businessName":"Test"}' | jq
```
Expected: `401 Unauthorized`

## 6. Test Rate Limiting
```bash
# Run this command 12 times rapidly
for i in {1..12}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    'http://localhost:3000/api/v1/business-plan/list' \
    -H 'Authorization: Bearer demo-api-key-12345'
done
```
Expected: Should see `429` (rate limit) after 10-11 requests

---

## Without jq (if not installed):
Just remove `| jq` from the commands above
