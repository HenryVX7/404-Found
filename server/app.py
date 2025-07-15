import os, json, requests
from flask import Flask, request, jsonify
from flask_cors import CORS       # allow requests from http://localhost:*

API_KEY    = os.getenv("GODADDY_API_KEY")
API_SECRET = os.getenv("GODADDY_API_SECRET")

HEADERS = {
    "Authorization": f"sso-key {API_KEY:API_SECRET}",
    "Accept": "application/json",
    "Content-Type": "application/json",
}

app = Flask(__name__)
CORS(app)   # <‑‑ simplest: wide‑open CORS for dev

CaaS_URL = "https://caas.api.godaddy.com/v1/prompts"

@app.post("/prompt")
def prompt():
    data = request.get_json()
    prompt_text = data.get("prompt", "")

    body = {
        "prompt": prompt_text,
        "provider": "openai_text",
        "providerOptions": {"model": "gpt-4o-mini"}   # adjust to what GoDaddy exposes
    }

    # call GoDaddy
    r = requests.post(CaaS_URL, json=body, headers=HEADERS, timeout=30)
    r.raise_for_status()
    caas = r.json()

    # --- NORMALISE ---
    # CaaS returns something like {"choices":[{"text":"..."}]} for text models
    text_out = caas["choices"][0]["text"]

    return jsonify({"text": text_out})
