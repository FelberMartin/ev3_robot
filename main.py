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


# Configure the EV3 Brick
ev3 = EV3Brick()
ev3.speaker.set_speech_options(voice="f1")

motorLeft = Motor(Port.A)
motorRight = Motor(Port.D)

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



motorSpeed = 100

def forward():
    angle = 500
    motorLeft.run_angle(speed=motorSpeed, rotation_angle=angle, wait=False)
    motorRight.run_angle(speed=motorSpeed, rotation_angle=angle)

def turn(left = True):
    angle = 100
    motorLeftAngle = angle
    motorRightAngle = -angle
    if not left:
        motorLeftAngle = -angle
        motorRightAngle = angle

    motorLeft.run_angle(speed=motorSpeed, rotation_angle=motorLeftAngle, wait=False)
    motorRight.run_angle(speed=motorSpeed, rotation_angle=motorRightAngle)   


def readCommands():
    while True:
        print("Waiting for command...")
        mbox.wait()
        print(mbox.read())
        if mbox.read() == Command.FORWARD:
            forward()
        elif mbox.read() == Command.TURN_LEFT:
            turn(left=True)
        elif mbox.read() == Command.TURN_RIGHT:
            turn(left=False)
        elif mbox.read() == Command.HEARTBEAT:
            print("Heartbeat received")
            continue
        else:
            print("Unknown command")

        mbox.send("done")
        print("Sent done message")



# Main program
connectBluetooth()
readCommands()
