import { login, getUserData, getUserBooks, saveBooks } from "./APIHandler"
import { Book, Note, Entry } from "./Classes"




export class Client {

    constructor(uuid: string, token: string, username: string, profilePicture: string) {
        this.uuid = uuid
        this.token = token
        this.username = username
        this.profilePicture = profilePicture
        this.books = []
    }


    uuid: string
    token: string // TODO: save this in a safer location

    username: string
    profilePicture: string

    getToken() {
        return this.token;
    }



    books: Book[]



    static async createClient(email: string, password: string) {
        
        
        var result = await login(email, password)
        
        if (result == null) { return null; }

        const [uuid, token] = result
        console.log(`Logged in as ${uuid}`)



        const dataResult = await getUserData(uuid, token)
        if (dataResult == null) { return null; }

        const [username, _, profilePicture, created_at] = dataResult




        const client: Client = new Client(uuid, token, username, profilePicture)

        client.books = await getUserBooks(uuid, token)

        return client
    }



    async save() {
        saveBooks(this.uuid, this.getToken(), {"books": this.books})
    }
}