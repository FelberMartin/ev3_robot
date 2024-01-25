from my_pybricks.messaging import BluetoothMailboxClient, TextMailbox
from time import sleep
from flask import Flask, request, Response
from pybricks.parameters import Port
from commands import Command
from flask_cors import CORS

import requests
import threading
import json
import random

import vis.visualization as visualization

isConnected = False

ev3_tag = "[EV3]"
# Color the EV3 tag to be gray
ev3_tag = "\033[90m" + ev3_tag + "\033[0m "


def connectBluetooth():
    global isConnected, client, mbox
    client = BluetoothMailboxClient()
    mbox = TextMailbox('talk', client)
    print(ev3_tag, "connecting to brick ...")
    try:
        client.connect("00:17:EC:ED:1E:3D")
        mbox.send("ready")
        print(ev3_tag, "\033[92mConnected!\033[0m")
        isConnected = True
    except:
        isConnected = False
        print(ev3_tag, "Could not connect to brick")
        sleep(5)
        connectBluetooth()


app = Flask(__name__)
CORS(app)


@app.route('/is_connected', methods=['GET'])
def is_connected():
    return str(isConnected)


algorithm_index = 0

@app.route('/get_algorithm', methods=['GET'])
def get_algorithm():
    options = ["right_hand_rule", "left_hand_rule", "random_mouse"]
    return options[0]
    global algorithm_index
    algorithm = options[algorithm_index]
    algorithm_index = (algorithm_index + 1) % len(options)
    return algorithm

@app.route('/forward', methods=['POST'])
def forward():
    return send_command(request, Command.FORWARD)

@app.route('/turn', methods=['POST'])
def turn():
    direction = request.form['direction']
    print(ev3_tag, "Turning ", direction)
    assert(direction == "left" or direction == "right")
    return send_command(request, Command.TURN_LEFT if direction == "left" else Command.TURN_RIGHT)

@app.route('/left', methods=['POST'])
def left():
    return send_command(request, Command.TURN_LEFT)

@app.route('/right', methods=['POST'])
def right():
    return send_command(request, Command.TURN_RIGHT)

@app.route('/infrared', methods=['POST'])
def infrared():
    return send_command(request, Command.INFRARED_SENSOR)

@app.route('/color', methods=['POST'])
def color():
    return send_command(request, Command.COLOR_SENSOR)

@app.route('/motor', methods=['POST'])
def motor():
    side = request.form['side']
    assert(side == "left" or side == "right")
    measure = request.form['measure']
    assert(measure == "speed" or measure == "angle")
    
    return send_command(request, "motor_" + side + "_" + measure)

@app.route('/all_measures', methods=['POST'])    
def all_measures():
    return send_command(request, Command.ALL_MEASURES)
    if type(response) != str:
        return response
    response = response.replace("'", '"')   # CPEE requires double quotes
    return json.loads(response)

def send_command(request, command):
    if not isConnected:
        return Response("EV3 not connected", status=503)
    
    callback_url = "____no_cpee_callback_provided"
    if "CPEE_CALLBACK" in request.headers:
        callback_url = request.headers["CPEE_CALLBACK"]

    mbox.send(callback_url + "," + command)
    return Response(status=200, headers={'content-type': 'application/json', 'CPEE-UPDATE': 'true'})

def send_callbacks():
    last_response = None
    while True:
        if not isConnected:
            sleep(3)
            continue

        response = mbox.read()
        if response == last_response or response == None:
            sleep(0.00001)
            continue

        last_response = response

        print(ev3_tag, "Received response from EV3: ", response)
        callback_url = response.split(",")[0]
        data = response.split(",", 1)[1]
        if "http" not in callback_url:
            continue

        if "'" in data:
            data = data.replace("'", '"')
            data = json.loads(data)
            requests.put(callback_url, json=data)
            continue

        print(ev3_tag, "Sending response to callback url: ", callback_url)
        requests.put(callback_url, data=data)

# ------------------------- Receiving data from CPEE ---------------------------    
@app.route('/', methods=['POST'])
def print_post_data():
    return visualization.handle_post_request(request)


# ------------------------- Sending data to Frontend ---------------------------
@app.route('/allRunData', methods=['GET'])
def data():
    return visualization.getData()

@app.route('/currentRunData', methods=['GET'])
def currentRun():
    return visualization.getCurrentRunData()


# Send heartbeats to EV3
def sendHeartbeats():
    global isConnected
    counter = 0
    while True:
        if not isConnected:
            print(ev3_tag, "Connecting to EV3")
            connectBluetooth()

        sleep(3)

        try:
            callback_url = "heartbeatcallback_" + str(counter)
            counter += 1
            mbox.send(callback_url + "," + Command.HEARTBEAT)
            print(ev3_tag, "Sent heartbeat")
        except Exception as e:
            print(ev3_tag, "\033[91m" + str(e) + "\033[0m")
            isConnected = False
            print(ev3_tag, "Could not send heartbeat")
            connectBluetooth()

def runServer():
    visualization.initialize()
    app.run(host="localhost", port=8080)

# Run the app
if __name__ == '__main__':
    threading.Thread(target=runServer).start()
    threading.Thread(target=send_callbacks).start()
    threading.Thread(target=sendHeartbeats).start()
