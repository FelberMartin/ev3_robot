from flask import Flask, request

app = Flask(__name__)

@app.route('/')
def hello():
    print("Server called!")
    return "Hello, World!"

# Print post request data
@app.route('/', methods=['POST'])
def print_post_data():
    print("Server called!")
    print(request.json)
    return "Post called"


if __name__ == '__main__':
    app.run(host="localhost", port=8080)
