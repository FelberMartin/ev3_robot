from my_pybricks.messaging import BluetoothMailboxClient, TextMailbox
from time import sleep

client = BluetoothMailboxClient()
mbox = TextMailbox('talk', client)
client.connect("00:17:EC:ED:1E:3D")
print("connected to brick 1...")
mbox.send("ready")
print("Sent first message to EV3")

print("Now waiting for values from the EV3...")

while True:
    mbox.wait()
    print(mbox.read())