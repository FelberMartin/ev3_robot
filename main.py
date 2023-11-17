#!/usr/bin/env pybricks-micropython
from pybricks.hubs import EV3Brick
from pybricks.ev3devices import (Motor, TouchSensor, ColorSensor,
                                 InfraredSensor, UltrasonicSensor, GyroSensor)
from pybricks.parameters import Port, Stop, Direction, Button, Color
from pybricks.tools import wait, StopWatch, DataLog
from pybricks.robotics import DriveBase
from pybricks.media.ev3dev import SoundFile, ImageFile


from pybricks.messaging import BluetoothMailboxClient, TextMailbox

# # This is the name of the remote EV3 or PC we are connecting to.
# SERVER = 'mf.ubuntu'

# client = BluetoothMailboxClient()
# mbox = TextMailbox('greeting', client)

# print('establishing connection...')
# client.connect(SERVER)
# print('connected!')

# # In this program, the client sends the first message and then waits for the
# # server to reply.
# mbox.send('hello!')
# print("sent!")
# print("waiting for reply...")
# mbox.wait()
# print("got reply!")
# print(mbox.read())

# Try the EV3 as a server:

from pybricks.hubs import EV3Brick
from pybricks.messaging import BluetoothMailboxServer, TextMailbox

ev3 = EV3Brick()
server = BluetoothMailboxServer()
mbox = TextMailbox('talk', server)

ev3.speaker.set_speech_options(voice="f1")
ev3.speaker.beep(frequency=300)
print("waiting for connection...")
server.wait_for_connection()

print("connected.")
ev3.speaker.beep(frequency=500)

ev3.speaker.say(mbox.read())


# Write your program here.
colorSensor = ColorSensor(port=Port.S2)

while True:
    color = colorSensor.color()

    ev3.screen.clear()
    ev3.screen.draw_text(x=10, y=10, text=color)

    color_str = str(color)
    if color is not None:
        color_str = color_str.split(".")[1]
    ev3.speaker.say(color_str)

    mbox.send(color)
    wait(1)
