#!/usr/bin/env pybricks-micropython
from pybricks.hubs import EV3Brick
from pybricks.ev3devices import (Motor, TouchSensor, ColorSensor,
                                 InfraredSensor, UltrasonicSensor, GyroSensor)
from pybricks.parameters import Port, Stop, Direction, Button, Color
from pybricks.tools import wait, StopWatch, DataLog
from pybricks.robotics import DriveBase
from pybricks.media.ev3dev import SoundFile, ImageFile


from pybricks.messaging import BluetoothMailboxClient, TextMailbox

# This is the name of the remote EV3 or PC we are connecting to.
SERVER = 'DESKTOP-FIM7N7B'

client = BluetoothMailboxClient()
mbox = TextMailbox('greeting', client)

print('establishing connection...')
client.connect(SERVER)
print('connected!')

# In this program, the client sends the first message and then waits for the
# server to reply.
mbox.send('hello!')
print("sent!")
print("waiting for reply...")
mbox.wait()
print("got reply!")
print(mbox.read())



# Create your objects here.
ev3 = EV3Brick()


# Write your program here.
ev3.speaker.beep()
