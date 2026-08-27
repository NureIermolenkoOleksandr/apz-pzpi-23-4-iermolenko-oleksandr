import mqtt from 'mqtt';
import { prisma } from '../config/db.js'; 

let client;

export const connect = () => {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  
  client = mqtt.connect(brokerUrl, {
    clientId: 'backend_service_' + Date.now()
  });

  client.on('connect', () => {
    console.log('Backend connected to MQTT');
    client.subscribe('locks/+/events');
    client.subscribe('locks/+/status'); 
  });

  client.on('message', async (topic, message) => {
    try {
      const parts = topic.split('/');
      const serialNumber = parts[1];
      const type = parts[2]; 
      const payloadStr = message.toString();

      const device = await prisma.device.findUnique({
        where: { serialNumber }
      });

      if (!device) return; 

      if (type === 'status') {
        const status = payloadStr === 'ONLINE' ? 'ONLINE' : 'OFFLINE';
        await prisma.device.update({
          where: { id: device.id },
          data: { 
            status: status,
            lastHeartbeat: new Date()
          }
        });
        console.log(`Updated status for ${serialNumber}: ${status}`);
      }

      if (type === 'events') {
        const data = JSON.parse(payloadStr);
        
        await prisma.telemetry.create({
          data: {
            deviceId: device.id,
            voltage: data.voltage,
            percentage: data.percentage,
            signalQuality: data.rssi,
            payload: data.sensors || {}
          }
        });

        await prisma.device.update({
          where: { id: device.id },
          data: { 
            batteryLevel: data.percentage,
            lastHeartbeat: new Date()
          }
        });
      }

    } catch (error) {
      console.error('MQTT Error:', error);
    }
  });
};

export const sendCommand = (serialNumber, action) => {
  if (!client) return;
  const topic = `locks/${serialNumber}/command`;
  const payload = JSON.stringify({ action, timestamp: Date.now() });
  client.publish(topic, payload);
  console.log(`Command sent to ${serialNumber}: ${action}`);
};