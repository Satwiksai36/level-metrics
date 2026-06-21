import fastify from 'fastify';
import cors from '@fastify/cors';
import { apiRoutes } from './routes/api.js';
const server = fastify({
    logger: true,
});
// Register CORS for frontend calls
await server.register(cors, {
    origin: '*', // For MVP, allow all origins. In production, restrict to frontend domain.
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
});
// Register routes
await server.register(apiRoutes, { prefix: '/api' });
// Health check endpoint
server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() };
});
const start = async () => {
    try {
        const port = Number(process.env.PORT) || 8080;
        const host = '0.0.0.0'; // Essential for Docker/Cloud Run deployment
        await server.listen({ port, host });
        console.log(`Server listening on http://${host}:${port}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map