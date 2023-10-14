import { once } from 'node:events'
import { createServer } from 'node:http'
import JWT from 'jsonwebtoken'

const PORT = 8080

const DEFAULT_USER = {
    username: 'ah98lg',
    password: '123456'
}

const JWT_KEY = 'secretkey123@'

async function loginRoute(request, response) {
    const { username, password } = JSON.parse(await once((request), 'data'))


    if (username !== DEFAULT_USER.username || password !== DEFAULT_USER.password) {
        response.writeHeader(401)
        response.end(JSON.stringify({ error: 'Missing username or password' }))

        return;
    }

    const auth_token = JWT.sign({ username, message: "Generating JWT" }, JWT_KEY)

    response.writeHeader(200)
    response.end(JSON.stringify({ auth_token }))
}

function headerAuthValidation(headers) {
    const auth = headers.authorization

    try {
        JWT.verify(auth, JWT_KEY)
        return true
    } catch (error) {
        return false
    }
}

async function handler(request, response) {

    if (request.url === '/login' && request.method === 'POST') {
        return loginRoute(request, response)
    }

    if (!headerAuthValidation(request.headers)) {
        response.writeHeader(400)
        response.end(JSON.stringify({ error: 'Missing JWT token' }))
        return;
    }

    response.writeHeader(200)
    response.end(JSON.stringify({ welcome_message: "Hello World!" }))
}

const app = createServer(handler).listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

export { app }