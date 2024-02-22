#!/usr/bin/env pybricks-micropython
from pybricks.hubs import EV3Brick
from pybricks.ev3devices import (Motor, TouchSensor, ColorSensor,
                                 InfraredSensor, UltrasonicSensor, GyroSensor)
from pybricks.parameters import Port, Stop, Direction, Button, Color
from pybricks.tools import wait, StopWatch, DataLog
from pybricks.robotics import DriveBase
from pybricks.media.ev3dev import SoundFile, ImageFile
from pybricks.messaging import BluetoothMailboxServer, TextMailbox

from commands import Command

import threading

# Configure the EV3 Brick
ev3 = EV3Brick()
ev3.speaker.set_speech_options(voice="f1")

motorLeft = Motor(Port.A)
motorRight = Motor(Port.D)
infraredSensor = InfraredSensor(Port.S3)
colorSensor = ColorSensor(Port.S2)

# Configure communication
server = BluetoothMailboxServer()
mbox = TextMailbox('talk', server)

def connectBluetooth():
    ev3.speaker.beep(frequency=300)
    print("waiting for connection...")  
    server.wait_for_connection()

    print("connected.")
    ev3.speaker.beep(frequency=500)
    if mbox.read() is not None:
        ev3.speaker.say(mbox.read())



motorSpeed = 400

def forward_async(callback_url, angle):
    forward(angle)
    mbox.send(callback_url + ",done")

def forward(angle):
    if angle is None:
        angle = 1465.5
    else:
        angle = int(angle)

    motorLeft.run_angle(speed=motorSpeed, rotation_angle=angle, wait=False)
    motorRight.run_angle(speed=motorSpeed, rotation_angle=angle)

def turn_async(callback_url, left, angle):
    turn(left=left, angle=angle)
    mbox.send(callback_url + ",done")

def turn(angle, left = True):
    if angle is None:
        angle = 500
    else:
        angle = int(angle)

    motorLeftAngle = -angle
    motorRightAngle = angle
    if not left:
        motorLeftAngle = angle
        motorRightAngle = -angle

    motorLeft.run_angle(speed=motorSpeed, rotation_angle=motorLeftAngle, wait=False)
    motorRight.run_angle(speed=motorSpeed, rotation_angle=motorRightAngle)  
    


def readCommands():
    while True:
        print("Waiting for command...")
        mbox.wait()
        msg = mbox.read()
        print("Received command: ", msg)

        callback_url = msg.split(",")[0]
        cmd = msg.split(",")[1]
        param = None
        if len(msg.split(",")) > 2:
            param = msg.split(",")[2]

        if cmd == Command.FORWARD:
            threading.Thread(target=forward_async, args=(callback_url, param)).start()
        elif cmd == Command.TURN_LEFT:
            threading.Thread(target=turn_async, args=(callback_url, True, param)).start()
        elif cmd == Command.TURN_RIGHT:
            threading.Thread(target=turn_async, args=(callback_url, False, param)).start()
        elif cmd == Command.INFRARED_SENSOR:
            mbox.send(callback_url + "," + str(infraredSensor.distance()))
        elif cmd == Command.COLOR_SENSOR:
            mbox.send(callback_url + "," + str(colorSensor.reflection()))
        elif cmd == Command.MOTOR_LEFT_ANGLE:
            mbox.send(callback_url + "," + str(motorLeft.angle()))
        elif cmd == Command.MOTOR_LEFT_SPEED:
            speed = motorLeft.speed()
            mbox.send(callback_url + "," + str(speed))
        elif cmd == Command.MOTOR_RIGHT_ANGLE:
            mbox.send(callback_url + "," + str(motorRight.angle()))
        elif cmd == Command.MOTOR_RIGHT_SPEED:
            mbox.send(callback_url + "," + str(motorRight.speed()))
        elif cmd == Command.ALL_MEASURES:
            responses = {}
            responses[Command.INFRARED_SENSOR] = infraredSensor.distance()
            responses[Command.COLOR_SENSOR] = colorSensor.reflection()
            responses[Command.MOTOR_LEFT_ANGLE] = motorLeft.angle()
            responses[Command.MOTOR_LEFT_SPEED] = motorLeft.speed()
            responses[Command.MOTOR_RIGHT_ANGLE] = motorRight.angle()
            responses[Command.MOTOR_RIGHT_SPEED] = motorRight.speed()
            mbox.send(callback_url + "," + str(responses))
        elif cmd == Command.HEARTBEAT:
            print("Heartbeat received")
            mbox.send(callback_url + ",Heartbeat received")
        else:
            print("Unknown command")
            mbox.send(callback_url, ",Unknown command")



# Main program
connectBluetooth()
readCommands()
