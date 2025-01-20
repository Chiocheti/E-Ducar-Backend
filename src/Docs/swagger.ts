import { OpenAPIV3 } from "openapi-types";

const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Documentação da API",
    version: "1.0.0",
    description: "Documentação da Api da E-DUCAR",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local servidor back-end",
    },
  ],
  paths: {
    "/auth/login": {
      post: {
        summary: "Loga um usuario",
        description: "Recebe os dados de um usuario por login e senha",
        responses: {
          "200": {
            description: "A list of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "12345",
                      },
                      name: {
                        type: "string",
                        example: "John Doe",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerDocument;
