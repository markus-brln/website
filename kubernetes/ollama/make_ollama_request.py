import requests
import json

url = "https://bauerlein.dev/chat/api/generate"
data = {
    "model": "deepseek-r1:1.5b",
    "prompt": "Respond with a random single word. And only that word. Don't say something like 'sure, how about X'. Only answer in 1 word",
    "stream": True
}

response = requests.post(url, json=data, stream=True)

responses = []
for line in response.iter_lines():
    if line:
        decoded_line = line.decode('utf-8')
        json_line = json.loads(decoded_line)
        if "response" in json_line:
            print(json_line["response"], end='', flush=True)
            responses.append(json_line["response"])
        if json_line.get("done") is True:
            print("\n\nFinal Statistics:")
            for key, value in json_line.items():
                print(f"{key}: {value}")
