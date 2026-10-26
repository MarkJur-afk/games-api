const express = require('express')
const app = express()
const port = process.env.PORT || 8080

const swaggerUi = require('swagger-ui-express')
const yamljs = require('yamljs')
const swaggerDocument = yamljs.load('./docs/swagger.yaml')

app.use(express.json())

const games = [
    { id: 1, name: 'Witcher 3', price: 29.99 },
    { id: 2, name: 'Cyberpunk 2077', price: 59.99 },
    { id: 3, name: 'Minecraft', price: 26.99 },
    { id: 4, name: 'Counter-Strike: Global Offensive', price: 0 },
    { id: 5, name: 'Roblox', price: 0 },
    { id: 6, name: 'Grand Theft Auto V', price: 29.99 },
    { id: 7, name: 'Valorant', price: 0 },
    { id: 8, name: 'Forza Horizon 5', price: 59.99 }
]

let nextId = Math.max(...games.map((game) => game.id)) + 1

const isAuthenticated = (req, res, next) => {
    const userId = Number.parseInt(req.header('x-user-id'), 10)

    if (![1, 2].includes(userId)) {
        return res.status(401).send({ error: 'Unauthorized: x-user-id must be 1 or 2' })
    }

    req.userId = userId
    next()
}

const isAdmin = (req, res, next) => {
    const userId = Number.parseInt(req.header('x-user-id'), 10)

    if (![1, 2].includes(userId)) {
        return res.status(401).send({ error: 'Unauthorized: x-user-id must be 1 or 2' })
    }

    if (userId !== 1) {
        return res.status(403).send({ error: 'Access denied: Admin role required' })
    }

    next()
}

app.get('/games', (req, res) => {
    res.send(games)
})

app.get('/games/:id', (req, res) => {
    const id = Number.parseInt(req.params.id, 10)

    if (Number.isNaN(id)) {
        return res.status(400).send({ error: 'Invalid ID format' })
    }

    const game = games.find((item) => item.id === id)

    if (!game) {
        return res.status(404).send({ error: 'Game not found' })
    }

    res.send(game)
})

app.post('/games', isAuthenticated, (req, res) => {
    const { name, price } = req.body

    if (!name || price === undefined || price === null) {
        return res.status(400).send({ error: 'One or more required fields are missing' })
    }

    if (typeof name !== 'string' || typeof price !== 'number' || Number.isNaN(price) || price < 0) {
        return res.status(400).send({ error: 'Invalid game parameter values' })
    }

    if (games.some((game) => game.name.toLowerCase() === name.trim().toLowerCase())) {
        return res.status(409).send({ error: 'Game with the same title already exists' })
    }

    const game = {
        id: nextId++,
        name: name.trim(),
        price
    }

    games.push(game)

    res.status(201)
        .location(`${getBaseUrl(req)}/games/${game.id}`)
        .send(game)
})

app.delete('/games/:id', isAdmin, (req, res) => {
    const id = Number.parseInt(req.params.id, 10)

    if (Number.isNaN(id)) {
        return res.status(400).send({ error: 'Invalid ID format' })
    }

    const index = games.findIndex((game) => game.id === id)

    if (index === -1) {
        return res.status(404).send({ error: 'Game not found' })
    }

    games.splice(index, 1)
    res.status(204).end()
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`)
})

function getBaseUrl(req) {
    return `${req.protocol}://${req.get('host')}`
}
