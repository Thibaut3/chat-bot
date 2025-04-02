from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
    print("ICI",os.environ)
    return render_template('index.html')

if __name__ == '__main__':
    print("ICI",os.environ)
    app.run(debug=True)
