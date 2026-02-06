# create a request of the url and capture the response
import requests  # type: ignore

response = requests.get("https://api.github.com")

try:
    # Validate response
    response.raise_for_status()
    
    # Print response summary
    print(f"Status: {response.status_code} | Method: {response.request.method} | OK: {response.ok}")
    print(f"URL: {response.url}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    print(f"Content Size: {len(response.content)} bytes")
    print(f"Elapsed: {response.elapsed}")
    
    # Print JSON response
    try:
        print("JSON:", response.json())
    except ValueError:
        print("Response is not in JSON format.")
    
    # Print content preview
    print("Content Preview:", response.content[:100])
    
except requests.exceptions.HTTPError as e:
    print(f"HTTP error occurred: {e}")
# print the response json
print(response.json())
# print the response text length
print(len(response.text))
# print the response content length
print(len(response.content))
# print the response content
print(response.content)
# print the response raw
print(response.raw)
# print the response iter content
for chunk in response.iter_content(chunk_size=10):
    print(chunk)
    break
# print the response iter lines
for line in response.iter_lines():
    print(line)
    break
# print the response close
response.close()
print("Response closed")