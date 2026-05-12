"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const config_1 = require("../config");
exports.dbConnect = {
    url: `mongodb+srv://${config_1.DB_USER}:${config_1.DB_PASSWORD}@cluster0.j3ewswr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
};
