#!/usr/bin/python
#flow-meter.py

import RPi.GPIO as GPIO
import time, sys

FLOW_SENSOR = 17

GPIO.setmode(GPIO.BCM)
GPIO.setup(FLOW_SENSOR, GPIO.IN, pull_up_down = GPIO.PUD_UP)

global count
count = 0

def countPulse(channel):
	global count
	count = count+1
	print count
	flow = count / (60 * 7.5)
	print(flow)

GPIO.add_event_detect(FLOW_SENSOR, GPIO.FALLING, callback=countPulse, bouncetime=50)

while True:
    try:
		start_counter = 1
		time.sleep(1)		
    except KeyboardInterrupt:
        print '\ncaught keyboard interrupt!, bye'
        GPIO.cleanup()
        sys.exit()