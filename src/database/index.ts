import {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    NODE_ENV,
    DB_USER,
    DB_PASSWORD,
 } from '@config'
 
 export const dbConnect = {
    url:`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.j3ewswr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    options: {
       useNewUrlParser: true,
       useUnifiedTopology: true,
    },
 }
 