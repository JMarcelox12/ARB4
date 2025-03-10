const mongoose = require('mongoose')

mongoose.conect("mongodb://jmcostasevero12:Manga1579@my-bdd-shard-00-00.k1hbe.mongodb.net:27017,my-bdd-shard-00-01.k1hbe.mongodb.net:27017,my-bdd-shard-00-02.k1hbe.mongodb.net:27017/?ssl=true&replicaSet=atlas-ofm18e-shard-0&authSource=admin&retryWrites=true&w=majority&appName=my-bdd");

module.exports = mongoose