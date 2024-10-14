import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc, {Information, SwaggerDefinition} from 'swagger-jsdoc';

function setUpSwagger({
                          app,
                          title,
                          version,
                          description,
                          baseURL,
                          dirToScan,
                          routePath,
                          tags,
                      }: {
    app: express.Application;
    title: string;
    version?: string;
    description?: string;
    baseURL: string;
    dirToScan?: string[];
    routePath?: string;
    tags?: { name: string; description?: string }[];
}): void {
    if (!app) return;

    if (!version) version = process.env.VERSION + '';

    const swaggerDefinition = {
        openapi: '3.0.0',
        info: {
            title,
            version,
            description,
            contact: {
                name: 'Castler',
                url: 'https://www.castler.com',
            },
        } as Information,
        servers: [
            {
                url: baseURL,
                description: 'Current server',
            },
        ],
        tags,
        produces: ['application/json'],
        schemes: ['http', 'https'],
        components: {
            securitySchemes: {
                Bearer: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                },
            },
        },
    } as SwaggerDefinition;

    const options = {
        swaggerDefinition,
        // Paths to files containing OpenAPI definitions
        apis: dirToScan || [
            './src/**/*.ts',
            './build/**/*.js'
        ],
        customCss: 'small.version-stamp { display: none }',
    };

    const swaggerSpec = swaggerJSDoc(options);
    app.use(
        '/' + (routePath || 'swagger-ui'),
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );
}

export default setUpSwagger;
