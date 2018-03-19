const topicHandler = {
    global: function(data) {
        console.log(data);
    },
    solenoid: function(deviceId, data) {
        data = data.toString();
        if (data == 'open') {
            console.log('Abrindo solenoide do Dispositivo', deviceId)
            // Abrir valvula solenoide via GPIO            
            return;
        }
        console.log('Fechando solenoide do Dispositivo', deviceId)
        // Fecha valvula solenoide via GPIO
    },
    reload: function(data) {
        // Reinicia programa
    }
}


module.exports = topicHandler;