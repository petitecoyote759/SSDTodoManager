import { login, getUserData } from "./APIHandler"




export class Client {

    constructor(uuid: string, token: string, username: string, profilePicture: string) {
        this.uuid = uuid
        this.token = token
        this.username = username
        this.profilePicture = profilePicture
    }


    uuid: string
    token: string // TODO: save this in a safer location

    username: string
    profilePicture: string

    getToken() {
        return this.token;
    }



    static async createClient(email: string, password: string) {
        
        
        var result = await login(email, password)
        if (result == null) { return null; }

        const [uuid, token] = result
        console.log(`Logged in as ${uuid}`)



        const dataResult = await getUserData(uuid, token)
        if (dataResult == null) { return null; }

        const [username, _, profilePicture, created_at] = dataResult




        const client: Client = new Client(uuid, token, username, profilePicture)

        return client
    }
}