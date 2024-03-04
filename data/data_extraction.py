from flask import Flask, render_template, request, jsonify
import json
from flask_socketio import SocketIO, send
import json
import os
import time

# A list of CPEE instances that are allowed to send data to this server
instances = {"right_hand_rule", "left_hand_rule", "random_mouse", "test2", "lego_maze_solver_central"}

cpee_tag = "[CPEE]"
# Color the CPEE tag to be blue
cpee_tag = "\033[94m" + cpee_tag + "\033[0m "

# All the data from the run_data folder
all_run_data = []

# The current stream file that is being written to (from a live running instance)
current_run_data_file = None
current_run_data = []

# Sets up all the local variables with the initial data
def initialize():
    _update_all_run_data()

def _update_all_run_data():
    global all_run_data
    all_run_data = []
    # Initilize the data with all the files in the run_data folder
    # Data should be a list of dictionaries, where each dictionary represents a stream
    # Each dictionary should have the following keys: "key" (the file name) and "content" (the file content)
    for file_name in os.listdir("./data/run_data"):
        if file_name == current_run_data_file:
            continue

        with open(f"./data/run_data/{file_name}", 'r') as f:
            content = f.read()
            all_run_data.append({"id": file_name, "content": content})

    

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
            _handle_cpee_json_data(parsed_json)
        else:
            print(cpee_tag, "Received data from unknown CPEE instance ", parsed_json['instance'], " - ", parsed_json['instance-name'])

    else:
        print(cpee_tag, "No JSON data found")

    return 'OK'


# Process json data from relevant CPEE instances
def _handle_cpee_json_data(full_json):
    global current_run_data_file, current_run_data
    if 'state' in full_json['content']:
        if current_run_data_file == None and full_json['content']['state'] == 'running':
            current_run_data_file = full_json['timestamp'] + ".json"
        elif full_json['content']['state'] == 'stopped':
            current_run_data_file = None
            current_run_data = []

    if full_json['topic'] == 'stream' and full_json['datastream'] is not None:
        _handle_probe_data(full_json)

    elif full_json['topic'] == 'activity':
        _handle_activity_data(full_json)


# Handle data probes send from the CPEE
def _handle_probe_data(full_json):
    datastream = full_json['datastream']
    stream_point = datastream[0]['stream:point']
    
    print("+++ " + str(stream_point))
    _append_to_current_run_data(stream_point)


# Handle activity data send from the CPEE (by subscription in the xml model).
def _handle_activity_data(full_json):
    content = full_json['content']
    if "timeout" in content['endpoint']:
        return
    
    relevant_keys = ["activity", "label", "endpoint", "passthrough"]
    content = {k: content[k] for k in relevant_keys if k in content}
    _append_to_current_run_data(content)
    
    

def _append_to_current_run_data(data):
    if current_run_data_file is None:
        print("*** Error: No stream file is currently open")
        return
    
    data['backendTimestampMs'] = time.time() * 1000
    current_run_data.append(data)

    with open(f"./data/run_data/{current_run_data_file}", 'w') as f:
        f.write(json.dumps(current_run_data))

def get_all_run_data():
    _update_all_run_data()
    return all_run_data

def get_current_run_data():
    if current_run_data_file is None:
        return []

    return current_run_data
