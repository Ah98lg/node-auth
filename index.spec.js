import { it, describe, before, after } from "node:test"
import { deepEqual, ok, strictEqual } from "node:assert"

const BASE_URL = "http://localhost:8080"

describe('App test coverage', () => {
    let _server = {}
    before(async () => {
        _server = (await import("./index.js")).app

        await new Promise(resolve => _server.once('listening', resolve))
    })

    it('Should return error when password or username is missing', async () => {

        const data = {
            username: "ah98lg",
            password: ""
        }

        const request = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify(data)
        })

        strictEqual(request.status, 401)

        const response = await request.json()

        deepEqual(response, { error: "Missing username or password" })
    })

    it('Should return 200 if username and password match', async () => {

        const data = {
            username: "ah98lg",
            password: "123456"
        }

        const request = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify(data)
        })

        strictEqual(request.status, 200)

        const response = await request.json()

        ok(response, "Token must exist")

    })

    it('Should not be able to access any route if is without a token', async () => {

        const request = await fetch(`${BASE_URL}`, {
            method: 'GET',
            headers: {
                authorization: ""
            }
        })

        strictEqual(request.status, 400)

        const response = await request.json()

        deepEqual(response, { error: "Missing JWT token" })
    })

    it('Should be able to retrieve data if authenticated', async () => {

        const auth = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({
                username: "ah98lg",
                password: "123456"
            })
        })

        const auth_token = (await auth.json()).auth_token

        const request = await fetch(`${BASE_URL}`, {
            method: 'GET',
            headers: {
                authorization: auth_token
            }
        })

        strictEqual(request.status, 200)

        const response = await request.json()

        deepEqual(response, { welcome_message: "Hello World!" })
    })

    after(done => _server.close(done))
})