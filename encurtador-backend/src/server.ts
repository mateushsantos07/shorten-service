import fastify from 'fastify';
import cors from '@fastify/cors';
import { shortenController } from './controllers/ShortenController';

const app = fastify();

app.register(cors, {
    origin: true,
    methods: ['GET', 'POST']
}) // ADICIONAR O CORS

app.register(shortenController); // ADICIONA O CONTROLLER

app.listen({ port: 3333 }).then(() => {
    console.log("Backend rodando na porta 3333!!!")
})