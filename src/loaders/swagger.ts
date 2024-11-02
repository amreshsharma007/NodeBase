import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc, {Information, SwaggerDefinition} from 'swagger-jsdoc';
import PathUtils from '../utils/path.utils';

function setUpSwagger({
                          app,
                          title,
                          version,
                          description,
                          baseURL,
                          dirToScan,
                          routePath,
                          routePrefix,
                          tags,
                          contact,
                      }: {
    app: express.Application;
    title: string;
    version?: string;
    description?: string;
    baseURL: string;
    dirToScan?: string[];
    routePath?: string;
    routePrefix?: string;
    tags?: { name: string; description?: string }[];
    contact?: {
        name?: 'Castler';
        url?: 'https://www.castler.com';
    };
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
                name: contact?.name || 'Castler',
                url: contact?.url || 'https://www.castler.com',
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
            './build/**/*.js',
            './node_modules/@ncome/v1-base/dist/*.ts',
        ],
        customCss: 'small.version-stamp { display: none }',
    };

    const swaggerSpec = swaggerJSDoc(options) as {
        paths: string[];
    };

    // Apply prefix in all the endpoints
    for (const path of Object.keys(swaggerSpec['paths'])) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        swaggerSpec['paths'][PathUtils.prepare(routePrefix, path)] =
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            swaggerSpec['paths'][path];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete swaggerSpec['paths'][path];
    }

    app.use(
        PathUtils.prepare(routePrefix, routePath, 'swagger-ui'),
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );
}

export default setUpSwagger;
