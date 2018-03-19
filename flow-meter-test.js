require('console-stamp')(console, '[HH:MM:ss.l]');
const gpio = require('rpi-gpio');
const mqtt = require('mqtt');
const readline = require('readline');
const topicHandler = require('./topicHandler');
const deviceId = process.env.DEVICE_ID || 0;
const broker = process.env.BROKER || 'mqtt://192.168.0.4';
const client = mqtt.connect(broker);

// Fazer requisição dos dados do device no servidor
// Deixar dados padrao salvos em texto

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const delay = 1000;
const sensorPin = parseInt(process.env.SENSOR_PIN, 10);
const solenoidPin = parseInt(process.env.SOLENOID_PIN, 10);

gpio.setup(sensorPin, gpio.DIR_IN, gpio.EDGE_RISING);
gpio.setup(solenoidPin, gpio.DIR_OUT);

gpio.on('change', function(channel, value) {
    console.log('Channel ' + channel + ' value is now ' + value);
});

const sensorSimulator = () => {
    let rnd = Math.random().toString();
    client.publish('flowsensor/' + deviceId, rnd);
};

client.on('connect', () => {
    client.subscribe('global');
    client.subscribe('solenoid/' + deviceId);
    console.log('Connected to MQTT broker', broker);
});

client.on('message', (topic, data) => {
    let device = null;
    let pattern = /(.+)\/(\d{1,2})/;
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
    if (input == 'stop-simulation') {
        clearInterval(sensorSimulator);
    }
});

function startSimulation() {
    setInterval(sensorSimulator, delay);
}

startSimulation();





