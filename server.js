const Koa = require('koa');
const Router = require('koa-router');
const koaSlow = require('koa-slow');
const serve = require('koa-static');
const cors = require('@koa/cors');
const path = require('path');
const { faker } = require('@faker-js/faker');

const app = new Koa();
const router = new Router();
const port = 7070;

const slowMiddleware = koaSlow({
    delay: 2500,
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = { error: err.message };
        console.error(err);
    }
});

app.use(cors());

app.use(serve(path.join(__dirname, 'public')));

const generateNews = (count) => {
    const news = [];
    for (let i = 0; i < count; i++) {
        const message = {
            id: faker.string.uuid(),
            picture: faker.image.avatar(),
            title: faker.lorem.sentence(),
            received: faker.date.between({ from: new Date(2020, 0, 1), to: new Date(2024, 8, 26) }),
        };
        news.push(message);
    }
    return news;
};

router.get('/api/news', slowMiddleware, async (ctx) => {
    const newNews = generateNews(3);
    ctx.body = {
        status: 'ok',
        timestamp: Math.floor(Date.now() / 1000),
        news: newNews,
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});