import { login, getUserData, getUserBooks, saveBooks, getUsersTags, saveTags, checkCurrentUser, logout, createUser } from "./APIHandler"
import { Book, Note, Entry, Tag } from "./Classes"




export class Client {

    constructor(uuid: string, username: string, profilePicture: string) {
        this.uuid = uuid
        this.username = username
        this.profilePicture = profilePicture
        this.books = []
        this.tags = []
    }


    uuid: string

    username: string
    profilePicture: string


    books: Book[]
    tags: Tag[]


    static async createClient(email: string, password: string) {
        
        var result = await login(email, password)
        
        if (result == null) { return null; }

        var uuid = result
        console.log(`Logged in as ${uuid}`)




        const dataResult = await getUserData(uuid)
        if (dataResult == null) { return null; }

        const [username, _, profilePicture, created_at] = dataResult


        const client: Client = new Client(uuid, username, profilePicture)

        client.books = await getUserBooks(uuid)

        client.tags = await getUsersTags(uuid)

        return client
    }

    static async checkExistingClient(): Promise<Client | null> {
        var result = await checkCurrentUser()

        if (result == null) { return null }
        
        const uuid = result

        
        const dataResult = await getUserData(uuid)
        if (dataResult == null) { return null; }

        const [username, _, profilePicture, created_at] = dataResult


        const client: Client = new Client(uuid, username, profilePicture)

        client.books = await getUserBooks(uuid)

        client.tags = await getUsersTags(uuid)

        return client
    }

    static async createNewClient(username: string, email: string, password: string): Promise<Client | null> {

        var createResult = await createUser(username, email, password)

        console.log(`Result = ${createResult}`)
        
        if (createResult == null) { return null; }

        return await this.createClient(email, password)
    }



    async save() {
        await saveTags(this.uuid, {"tags": this.tags})
        await saveBooks(this.uuid, {"books": this.books.filter(book => book.name !== "<<DEFAULT_BOOK>>" && book.book_id !== "")})
    }



    async logout() {
        await logout()
    }
}