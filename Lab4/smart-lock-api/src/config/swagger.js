import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Lock IoT API',
      version: '1.0.0',
      description: 'API documentation for Smart Lock System',
      contact: {
        name: 'API Support',
        email: 'support@smartlock.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], 
};

export const swaggerSpec = swaggerJsdoc(options);