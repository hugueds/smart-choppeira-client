require('console-stamp')(console, '[HH:MM:ss.l]');
const dotenv = require('dotenv').config();
const gpio = require('rpi-gpio');
const readline = require('readline');

let startCounter = true;
let pulseCounter = 0;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const delay = 1000;
const sensorPin = parseInt(process.env.SENSOR_PIN, 10);
const solenoidPin = parseInt(process.env.SOLENOID_PIN, 10);

gpio.setMode(gpio.MODE_BCM);

gpio.setup(sensorPin, gpio.DIR_IN, gpio.EDGE_RISING, (err, data) => {
	if (err) console.error(err);
	console.log(data);
});

gpio.setup(solenoidPin, gpio.DIR_OUT);

gpio.on('change', function(channel, value) {
    switch(channel) {
        case sensorPin: countPulse(value); break;
    }    
});

rl.on('line', (input) => {
    if (input == 'stop-simulation') {
        clearInterval(sensorSimulator);
    }
});

function countPulse(value) {    
    if (value)
	    pulseCounter += 1;
}

setInterval(function() { 
    if (pulseCounter > 0){
        let flow =  roundToThree(pulseCounter /(60 * 7.5));
        console.log('Total de pulsos é: ' + pulseCounter);        
        console.log('O fluxo é de '+ flow + ' litros por segundo');
    }        
    pulseCounter = 0;
}, 1000);

function roundToThree(num) {    
    return +(Math.round(num + "e+3")  + "e-3");
}