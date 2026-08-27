import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { prisma } from './config/db.js';
import routes from './routes/index.js';
import { swaggerSpec } from './config/swagger.js';
import * as mqttService from './services/mqttService.js';


console.log("[System] API Service Initializing...", new Date().toISOString());

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.get('/health', (req, res) => {
  console.log("[Health Check] Ping received");
  res.json({ status: 'OK', timestamp: new Date() });
});


app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Smart Lock API', 
    docs_ui: `http://localhost:${PORT}/api-docs`,
    docs_json: `http://localhost:${PORT}/api-docs.json`, 
    health: `http://localhost:${PORT}/health`
  });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err);
  const status = err.status || 500;
  res.status(status).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('[Database] Connected to PostgreSQL');
    

    mqttService.connect();

    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
      console.log(`[Swagger UI] http://localhost:${PORT}/api-docs`);
      console.log(`[Swagger JSON] http://localhost:${PORT}/api-docs.json`);
    });
  } catch (error) {
    console.error('[Database] Connection Failed:', error);
    process.exit(1);
  }
};

startServer();