from my_pybricks.messaging import BluetoothMailboxClient, TextMailbox
from time import sleep
from flask import Flask, request
from pybricks.parameters import Port
from commands import Command

import threading
import time

isConnected = False

def connectBluetooth():
    global isConnected, client, mbox
    client = BluetoothMailboxClient()
    mbox = TextMailbox('talk', client)
    print("connecting to brick ...")
    try:
        client.connect("00:17:EC:ED:1E:3D")
        mbox.send("ready")
        print("connected!")
        isConnected = True
    except:
        isConnected = False
        print("Could not connect to brick")
        sleep(5)
        connectBluetooth()


app = Flask(__name__)

@app.route('/forward', methods=['GET'])
def forward():
    mbox.send(Command.FORWARD)

    # Wait for done reply from EV3
    mbox.wait()
    return mbox.read()

@app.route('/left', methods=['GET'])
def left():
    mbox.send(Command.TURN_LEFT)

    # Wait for done reply from EV3
    mbox.wait()
    return mbox.read()

@app.route('/right', methods=['GET'])
def right():
    mbox.send(Command.TURN_RIGHT)

    # Wait for done reply from EV3
    mbox.wait()
    return mbox.read()

@app.route('/infrared', methods=['GET'])
def infrared():
    mbox.send(Command.INFRARED_SENSOR)

    # Wait for done reply from EV3
    mbox.wait()
    return mbox.read()

@app.route('/color', methods=['GET'])
def color():
    mbox.send(Command.COLOR_SENSOR)

    # Wait for done reply from EV3
    mbox.wait()
    return mbox.read()


@app.route('/run', methods=['POST'])
def run():
    print(request)
    print(request.content_type)
    cmd = request.form['command']
    param = None
    if 'parameter' in request.form:
        param = request.form['parameter']
    print("/run called with data: ", cmd, " ", param)

    if not isConnected:
        return "Not connected to EV3"

    # Validate command
    if cmd != Command.FORWARD and \
        cmd != Command.TURN_LEFT and \
        cmd != Command.TURN_RIGHT and \
        cmd != Command.INFRARED_SENSOR and \
        cmd != Command.COLOR_SENSOR:
        return "Invalid command"
    
    # Send command to EV3
    msg = cmd
    if param is not None:
        msg += "," + str(param)
    mbox.send(msg)

    # Wait for done reply from EV3
    mbox.wait()
    return mbox.read()
    
@app.route('/', methods=['POST'])
def print_post_data():
    return ""


# Send heartbeats to EV3
def sendHeartbeats():
    global isConnected
    while True:
        if not isConnected:
            print("Connecting to EV3")
            connectBluetooth()

        sleep(3)

        try:
            mbox.send(Command.HEARTBEAT)
            print("Sent heartbeat")
        except:
            isConnected = False
            print("Could not send heartbeat")
            connectBluetooth()

def runServer():
    app.run(host="localhost", port=8080)

# Run the app
if __name__ == '__main__':

    threading.Thread(target=runServer).start()
    threading.Thread(target=sendHeartbeats).start()