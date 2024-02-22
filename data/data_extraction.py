from flask import Flask, render_template, request, jsonify
import json
from flask_socketio import SocketIO, send
import json
import os
import time

# A list of CPEE instances that are allowed to send data to this server
instances = {"right_hand_rule", "left_hand_rule", "random_mouse", "test2", "lego_maze_solver_central"}

current_stream_file = None

cpee_tag = "[CPEE]"
# Color the CPEE tag to be blue
cpee_tag = "\033[94m" + cpee_tag + "\033[0m "

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
    for file_name in os.listdir("./data/streams"):
        if file_name == current_stream_file:
            continue

        with open(f"./data/streams/{file_name}", 'r') as f:
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

        if parsed_json['instance-name'] in instances:
            print(cpee_tag, "Received data from CPEE: ", parsed_json)
            _handle_data(parsed_json)
        else:
            print(cpee_tag, "Received data from unknown CPEE instance ", parsed_json['instance'], " - ", parsed_json['instance-name'])

    else:
        print(cpee_tag, "No JSON data found")

    return 'OK'


def _handle_data(full_json):
    global current_stream_file, current_data
    if 'state' in full_json['content']:
        if current_stream_file == None and full_json['content']['state'] == 'running':
            current_stream_file = full_json['timestamp'] + ".json"
        elif full_json['content']['state'] == 'stopped':
            current_stream_file = None
            current_data = []

    if full_json['topic'] == 'stream' and full_json['datastream'] is not None:
        _handle_probe_data(full_json)

    elif full_json['topic'] == 'activity':
        _handle_activity_data(full_json)


def _handle_probe_data(full_json):
    datastream = full_json['datastream']
    stream_point = datastream[0]['stream:point']

    if stream_point['stream:id'] == "algo":
        abreviation = "right" if "right_hand_rule" in stream_point['stream:value'] else "left"
        global current_stream_file
        current_stream_file = abreviation + current_stream_file
        return
    
    print("+++ " + str(stream_point))
    _append_to_current_data(stream_point)


def _handle_activity_data(full_json):
    content = full_json['content']
    if "timeout" in content['endpoint']:
        return
    
    relevant_keys = ["activity", "label", "endpoint", "passthrough"]
    content = {k: content[k] for k in relevant_keys if k in content}
    _append_to_current_data(content)
    
    

def _append_to_current_data(data):
    if current_stream_file is None:
        print("*** Error: No stream file is currently open")
        return
    
    data['backendTimestampMs'] = time.time() * 1000
    current_data.append(data)

    with open(f"./data/streams/{current_stream_file}", 'w') as f:
        f.write(json.dumps(current_data))

def getData():
    _update_data()
    return data

def getCurrentRunData():
    if current_stream_file is None:
        return []

    return current_data
