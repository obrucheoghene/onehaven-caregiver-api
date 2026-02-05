import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OneHaven Caregiver API',
      version: '1.0.0',
      description: 'Real-time caregiver management API for managing caregivers and protected members',
      contact: {
        name: 'OneHaven Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
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
      schemas: {
        Caregiver: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ProtectedMember: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            caregiverId: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            relationship: {
              type: 'string',
              enum: ['Son', 'Daughter', 'Parent', 'Grandparent', 'Spouse', 'Sibling', 'Other'],
            },
            birthYear: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SignupInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        CreateProtectedMemberInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'relationship', 'birthYear'],
          properties: {
            firstName: { type: 'string', minLength: 1 },
            lastName: { type: 'string', minLength: 1 },
            relationship: {
              type: 'string',
              enum: ['Son', 'Daughter', 'Parent', 'Grandparent', 'Spouse', 'Sibling', 'Other'],
            },
            birthYear: { type: 'integer', minimum: 1900 },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              default: 'active',
            },
          },
        },
        UpdateProtectedMemberInput: {
          type: 'object',
          properties: {
            firstName: { type: 'string', minLength: 1 },
            lastName: { type: 'string', minLength: 1 },
            relationship: {
              type: 'string',
              enum: ['Son', 'Daughter', 'Parent', 'Grandparent', 'Spouse', 'Sibling', 'Other'],
            },
            birthYear: { type: 'integer', minimum: 1900 },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                code: { type: 'string' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                code: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
