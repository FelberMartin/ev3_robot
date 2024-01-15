from flask import Flask, render_template, request, jsonify
import json
from flask_socketio import SocketIO, send
import json
import os

# A list of CPEE instances that are allowed to send data to this server
instances = {27148, 27207}

current_stream_file = None

data = []
current_data = []

def initialize():
    _update_data()

def _update_data():
    global data
    data = []
    # Initilize the data with all the files in the streams folder
    # Data should be a list of dictionaries, where each dictionary represents a stream
    # Each dictionary should have the following keys: "key" (the file name) and "content" (the file content)
    for file_name in os.listdir("./vis/streams"):
        if file_name == current_stream_file:
            continue

        with open(f"./vis/streams/{file_name}", 'r') as f:
            content = f.read()
            data.append({"id": file_name, "content": content})

    

def handle_post_request(request):
    boundary = request.headers['Content-Type'].split('boundary=')[1]
    boundary = boundary.strip('"')

    # Parse multipart form data
    data = request.get_data().decode('utf-8')
    parts = data.split('--' + boundary)

    # Find the part containing JSON data
    json_part = None
    for part in parts:
        if 'Content-Type: application/json' in part:
            json_part = part.strip()
            break

    # Extract the JSON data from the part
    if json_part:
        json_data = json_part.split('\r\n\r\n')[1].strip()
        parsed_json = json.loads(json_data)

        if parsed_json['instance'] in instances:
            print("[CPEE] Received data from CPEE: ", parsed_json)
            _handle_data(parsed_json)
        else:
            print("[CPEE] Received data from unknown CPEE instance ", parsed_json['instance'], " - ", parsed_json['instance-name'])

    else:
        print("[CPEE] No JSON data found")

    return 'OK'


def _handle_data(full_json):
    global current_stream_file, current_data
    if 'state' in full_json['content']:
        if full_json['content']['state'] == 'running':
            current_stream_file = full_json['timestamp']
        elif full_json['content']['state'] == 'stopped':
            current_stream_file = None
            current_data = []

    if full_json['topic'] == 'stream' and full_json['datastream'] is not None:
        _handle_probe_data(full_json)


def _handle_probe_data(full_json):
    datastream = full_json['datastream']
    stream_point = datastream[0]['stream:point']

    print("+++ " + str(stream_point))
    _store_stream_point(stream_point)
    
    

def _store_stream_point(stream_point):
    if current_stream_file is None:
        raise Exception("No stream file is currently open")
    
    current_data.append(stream_point)

    with open(f"./vis/streams/{current_stream_file}", 'a') as f:
        f.write(str(stream_point) + "\n")

def getData():
    return data

def getCurrentRunData():
    global current_stream_file
    if current_stream_file is None:
        return []

    return current_data