import { login, getUserData, getUserBooks, saveBooks, getUsersTags, saveTags } from "./APIHandler"
import { Book, Note, Entry, Tag } from "./Classes"




export class Client {

    constructor(uuid: string, token: string, username: string, profilePicture: string) {
        this.uuid = uuid
        this.token = token
        this.username = username
        this.profilePicture = profilePicture
        this.books = []
        this.tags = []
    }


    uuid: string
    token: string // TODO: save this in a safer location

    username: string
    profilePicture: string

    getToken() {
        return this.token;
    }



    books: Book[]
    tags: Tag[]


    static async createClient(email: string, password: string) {
        
        
        var result = await login(email, password)
        
        if (result == null) { return null; }

        var [uuid, token] = result
        console.log(`Logged in as ${uuid}`)



        const dataResult = await getUserData(uuid, token)
        if (dataResult == null) { return null; }

        const [username, _, profilePicture, created_at] = dataResult




        const client: Client = new Client(uuid, token, username, profilePicture)
        token = ""

        client.books = await getUserBooks(uuid, client.getToken())

        client.tags = await getUsersTags(uuid, client.getToken())

        return client
    }



    async save() {
        await saveTags(this.uuid, this.getToken(), {"tags": this.tags})
        await saveBooks(this.uuid, this.getToken(), {"books": this.books.filter(book => book.name !== "<<DEFAULT_BOOK>>" && book.book_id !== "")})
    }
}