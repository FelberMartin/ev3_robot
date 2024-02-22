from my_pybricks.messaging import BluetoothMailboxClient, TextMailbox
from time import sleep
from flask import Flask, request, Response
from pybricks.parameters import Port
from ev3.commands import Command
from flask_cors import CORS

import requests
import threading
import json
import random

import data.data_extraction as data_extraction

isConnected = False

ev3_tag = "[EV3]"
# Color the EV3 tag to be gray
ev3_tag = "\033[90m" + ev3_tag + "\033[0m "


def connectBluetooth():
    global isConnected, client, mbox_move, mbox_messure, mbox_heartbeat
    client = BluetoothMailboxClient()
    mbox_move = TextMailbox('move', client)
    mbox_messure = TextMailbox('measure', client)
    mbox_heartbeat = TextMailbox('heartbeat', client)
    print(ev3_tag, "connecting to brick ...")
    try:
        client.connect("00:17:EC:ED:1E:3D")
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
    return send_command(request, Command.FORWARD, mbox_move)

@app.route('/turn', methods=['POST'])
def turn():
    direction = request.form['direction']
    print(ev3_tag, "Turning ", direction)
    assert(direction == "left" or direction == "right")
    return send_command(request, Command.TURN_LEFT if direction == "left" else Command.TURN_RIGHT, mbox_move)

@app.route('/left', methods=['POST'])
def left():
    return send_command(request, Command.TURN_LEFT, mbox_move)

@app.route('/right', methods=['POST'])
def right():
    return send_command(request, Command.TURN_RIGHT, mbox_move)

@app.route('/infrared', methods=['POST'])
def infrared():
    return send_command(request, Command.INFRARED_SENSOR, mbox_messure)

@app.route('/color', methods=['POST'])
def color():
    return send_command(request, Command.COLOR_SENSOR, mbox_messure)

@app.route('/motor', methods=['POST'])
def motor():
    side = request.form['side']
    assert(side == "left" or side == "right")
    measure = request.form['measure']
    assert(measure == "speed" or measure == "angle")
    
    return send_command(request, "motor_" + side + "_" + measure, mbox_messure)

@app.route('/all_measures', methods=['POST'])    
def all_measures():
    return send_command(request, Command.ALL_MEASURES, mbox_messure)

def send_command(request, command, mbox):
    if not isConnected:
        return Response("EV3 not connected", status=503)
    
    callback_url = "____no_cpee_callback_provided"
    if "CPEE_CALLBACK" in request.headers:
        callback_url = request.headers["CPEE_CALLBACK"]

    mbox.send(callback_url + "," + command)
    response = mbox.wait_new()

    print(ev3_tag, "Received response from EV3: ", response)
    callback_url = response.split(",")[0]
    data = response.split(",", 1)[1]
    if "http" not in callback_url:
        return "OK"

    print(ev3_tag, "Sending response: ", callback_url)

    if "'" in data:
        data = data.replace("'", '"')
        data = json.loads(data)
        return data

    return data

# ------------------------- Receiving messages from EV3 + send callbacks to CPEE ---------------------------
def send_callbacks():
    last_response = None
    while True:
        if not isConnected:
            sleep(3)
            continue

        response = mbox.read()
        if response == last_response or response == None:
            sleep(0.0000001)
            continue

        last_response = response

        print(ev3_tag, "Received response from EV3: ", response)
        callback_url = response.split(",")[0]
        data = response.split(",", 1)[1]
        if "http" not in callback_url:
            continue

        print(ev3_tag, "Sending response to callback url: ", callback_url)

        if "'" in data:
            data = data.replace("'", '"')
            data = json.loads(data)
            requests.put(callback_url, json=data)
            continue

        requests.put(callback_url, data=data)

# ------------------------- Receiving data from CPEE ---------------------------    
@app.route('/', methods=['POST'])
def print_post_data():
    return data_extraction.handle_post_request(request)


# ------------------------- Sending data to Frontend ---------------------------
@app.route('/allRunData', methods=['GET'])
def data():
    return data_extraction.getData()

@app.route('/currentRunData', methods=['GET'])
def currentRun():
    return data_extraction.getCurrentRunData()


# ------------------------- Sending heartbeats to the EV3 ---------------------------
def send_heartbeats():
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
            mbox_heartbeat.send(callback_url + "," + Command.HEARTBEAT)
            print(ev3_tag, "Sent heartbeat")

            mbox_heartbeat.wait()
            print(ev3_tag, "Received heartbeat response")

        except Exception as e:
            print(ev3_tag, "\033[91m" + str(e) + "\033[0m")
            isConnected = False
            print(ev3_tag, "Could not send heartbeat")
            connectBluetooth()


# ------------------------- Main program ---------------------------
def runServer():
    data_extraction.initialize()
    app.run(host="localhost", port=8080)

# Run the app
if __name__ == '__main__':
    threading.Thread(target=runServer).start()
    # threading.Thread(target=send_callbacks).start()
    threading.Thread(target=send_heartbeats).start()
