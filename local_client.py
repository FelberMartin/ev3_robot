from my_pybricks.messaging import BluetoothMailboxClient, TextMailbox
from time import sleep
from flask import Flask, request, Response
from pybricks.parameters import Port
from commands import Command
from flask_socketio import SocketIO, send
from flask_cors import CORS, cross_origin  # Import the CORS module

import requests
import threading

import vis.visualization as visualization

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
socketio = SocketIO(app)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/forward', methods=['POST'])
def forward():
    return send_command(request, Command.FORWARD)

@app.route('/left', methods=['POST'])
def left():
    return send_command(request, Command.TURN_LEFT)

@app.route('/right', methods=['POST'])
def right():
    return send_command(request, Command.TURN_RIGHT)

@app.route('/infrared', methods=['POST'])
def infrared():
    return send_command(request, Command.INFRARED_SENSOR, sync=True)

@app.route('/color', methods=['POST'])
def color():
    return send_command(request, Command.COLOR_SENSOR, sync=True)

@app.route('/motor', methods=['POST'])
def motor():
    side = request.form['side']
    assert(side == "left" or side == "right")
    measure = request.form['measure']
    assert(measure == "speed" or measure == "angle")
    
    return send_command(request, "motor_" + side + "_" + measure, sync=True)

@app.route('/all_measures', methods=['POST'])    
def all_measures():
    response = send_command(request, Command.ALL_MEASURES, sync=True)
    response = response.replace("'", '"')   # CPEE requires double quotes
    return response

def send_command(request, command, sync=False):
    if not isConnected:
        return Response("EV3 not connected", status=503)
    
    callback_url = "____no_cpee_callback_provided"
    if "CPEE_CALLBACK" in request.headers:
        callback_url = request.headers["CPEE_CALLBACK"]

    if sync:
        sent_callback_url = callback_url[4:]    # Remove "http" from callback url
        mbox.send(sent_callback_url + "," + command)
        while True:
            mbox.wait()
            response = mbox.read()
            if sent_callback_url in response:
                return response.split(",", 1)[1]
    else:    
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
            sleep(0.001)
            continue

        last_response = response

        print("Received response from EV3: ", response)
        callback_url = response.split(",")[0]
        data = response.split(",")[1]
        if "http" not in callback_url:
            continue

        print("Sending response to callback url: ", callback_url)
        requests.put(callback_url, data=data)

# ------------------------- Receiving data from CPEE ---------------------------    
@app.route('/', methods=['POST'])
def print_post_data():
    return visualization.handle_post_request(request)


@app.route('/display', methods=['get'])
def display():
    return visualization.display()

@app.route("/", methods=['GET'])
@cross_origin()
def index():
    return "Hello, World!"

@socketio.on('connect')
def handle_connect():
    print("### Client connected with socketio")
    return visualization.handle_connect(socketio)


# Send heartbeats to EV3
def sendHeartbeats():
    global isConnected
    counter = 0
    while True:
        if not isConnected:
            print("Connecting to EV3")
            connectBluetooth()

        sleep(3)

        try:
            callback_url = "heartbeatcallback_" + str(counter)
            counter += 1
            mbox.send(callback_url + "," + Command.HEARTBEAT)
            print("Sent heartbeat")
        except Exception as e:
            print(e)
            isConnected = False
            print("Could not send heartbeat")
            connectBluetooth()

def runServer():
    visualization.initialize()
    socketio.run(app, host="localhost", port=8080)

# Run the app
if __name__ == '__main__':
    threading.Thread(target=send_callbacks).start()
    threading.Thread(target=sendHeartbeats).start()
    runServer()
