const app = require('express')()
const port = 8080

app.use(require('express').json())

const swaggerUi = require('swagger-ui-express')

const yamljs = require('yamljs')
const swaggerDocument = yamljs.load('./docs/swagger.yaml')

const games = [
    {id: 1, name: "Witcher 3", price: 29.99},
    {id: 2, name: "Cyberpunk 2077", price: 59.99},
    {id: 3, name: "Minecraft", price: 26.99},
    {id: 4, name: "Counter-Strike: Global Offensive", price: 0},
    {id: 5, name: "Roblox", price: 0},
    {id: 6, name: "Grand Theft Auto V", price: 29.99},
    {id: 7, name: "Valorant", price: 0},
    {id: 8, name: "Forza Horizon 5", price: 59.99}
]

app.get('/games', (req, res) => {
    res.send(games)
})

app.get('/games/:id', (req, res) => {
    const game = games[req.params.id - 1]

    if (!game) {
        return res.status(404).end()
    }

    res.send(game)
})

app.post('/games', (req, res) => {
    games.push({
        id: games.length + 1,
        price: req.body.price,
        name: req.body.name
    })

    res.status(201).end()
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`)
})
