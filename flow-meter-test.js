require('console-stamp')(console, '[HH:MM:ss.l]');
const dotenv = require('dotenv').config({path: __dirname + '/.env' });
const gpio = require('rpi-gpio');
const mqtt = require('mqtt');
const readline = require('readline');
const keypress = require('keypress');
const topicHandler = require('./topicHandler');
const deviceId = process.env.DEVICE_ID || 0;
const broker = process.env.BROKER || 'mqtt://192.168.0.6';
const client = mqtt.connect(broker);

let startCounter = true;
let pulseCounter = 0;

// Fazer requisição dos dados do device no servidor
// Deixar dados padrao salvos em texto

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


const delay = 1000;
const sensorPin = parseInt(process.env.SENSOR_PIN, 10);
const solenoidPin = parseInt(process.env.SOLENOID_PIN, 10);

gpio.setMode(gpio.MODE_BCM);

gpio.setup(sensorPin, gpio.DIR_IN, gpio.EDGE_RISING);
gpio.setup(solenoidPin, gpio.DIR_OUT);

gpio.on('change', function (channel, value) {
    switch (channel) {
        case sensorPin: countPulse(value); break;
    }
});

client.on('connect', () => {
    client.subscribe('global');
    client.subscribe('solenoid/' + deviceId);
    console.log('Connected to MQTT broker', broker);
});

client.on('message', (topic, data) => {
    let device = null;
    const pattern = /(.+)\/(\d{1,2})/;
    if (pattern.test(topic)) {
        let result = pattern.exec(topic);
        topic = result[1];
        device = parseInt(result[2]);
    }
    switch (topic) {
        case 'global': topicHandler.global(data); break;
        case 'solenoid': topicHandler.solenoid(device, data); break;
    }
});

rl.on('line', (input) => {
    console.log(`Cartão numero: ${input} lido`)
    client.publish('cardreader/' + deviceId, input);
    if (input === 'stop-simulation') {
        clearInterval(sensorSimulator);
    }
});

setInterval(function () {
    if (pulseCounter > 0) {
        let flow = roundToThree(pulseCounter / (60 * 7.5));
        client.publish('flowsensor/' + deviceId, flow.toString());
        console.log('Total de pulsos é: ' + pulseCounter);
        console.log('O fluxo é de ' + flow + ' litros por segundo');
    }
    pulseCounter = 0;
}, 1000);

function countPulse(value) {
    if (value)
        pulseCounter += 1;
}

function roundToThree(num) {
    return +(Math.round(num + "e+3") + "e-3");
}

const sensorSimulator = () => {
    let rnd = Math.random().toString();
    console.log(`Enviando para o topico flowsensor ${deviceId}, valor: ${rnd}`)
    client.publish('flowsensor/' + deviceId, rnd);
};

function startSimulation() {
    console.log('Initiating Flow Simulation');    
    setInterval(sensorSimulator, delay);
}

// startSimulation();

function onInit() {
    console.log('Starting Smart Choppeira Client Device');
    console.log(`RPI Device ID: ${deviceId}`);
    console.log(`Flow Sensor PIN: ${sensorPin}`);
    console.log(`Solenoid PIN: ${solenoidPin}`);
    console.log(`MQTT Broker: ${broker}`);
    if (process.argv[2] == '--s') {
        startSimulation();
    }

}

onInit();




