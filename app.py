from flask import Flask, render_template, request, jsonify
import base64
import os
from openai import OpenAI

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # Désactive l'échappement ASCII automatique

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_KEY"),
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    data = request.json
    image_data = data['image']
    print(data['image'][:50])
    print(data['image'][-50:])
    user_text = data['text']

    try:
        completion = client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"{image_data}"
                            }
                        }
                    ]
                }
            ]
        )
        return jsonify({"response": completion.choices[0].message.content}), 200, {'Content-Type': 'application/json; charset=utf-8'}
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
