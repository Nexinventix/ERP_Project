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
   // url:`mongodb+srv://colindecorce:colindecorce@cluster0.yiswx.mongodb.net/?retryWrites=true&w=majority`,
   // url:`mongodb+srv://colindecorce:colindecorce@cluster0.j3ewswr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
         // : `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, // For development
   options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   },
}
