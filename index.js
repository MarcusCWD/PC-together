const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const { default: axios } = require('axios');

// SETUP
const app = express();

// enable JSON data processing
app.use(express.json());

// case sensitive
app.set('case sensitive routing', true)

// enable CORS 
app.use(cors());

const MAIN_COLLECTION="build"
const CPU_COLLECTION="cpu";
const GPU_COLLECTION="gpu";
const MOBO_COLLECTION="mobo";
const RAM_COLLECTION="ram";

//ALL ROUTE
async function main(){
    await MongoUtil.connect(process.env.MONGO_URI, "pc_together");

    //====================BUILD: MAIN==========================//
    //READ
    // main page, user only needs to see image, name and voted of listing
    app.get('/build', async function(req,res){
        const db = MongoUtil.getDB();
        let mainList = await db.collection(MAIN_COLLECTION).find({
        }).project({
            'name': 1,
            'image': 1,
            'vote' : 1,
        }).toArray();
        res.json({
             "build":mainList
        })
    })
    
    //====================BUILD: FILTER (BRAND) MAIN==========================//
    //READ
    app.get('/build/:brand_name', async function(req,res){

        const db = MongoUtil.getDB();
        let mainList = await db.collection(MAIN_COLLECTION).find({
            'cpu_brand': {
                '$regex': req.params.brand_name,
                '$options':'i'
            }
        }).project({
            'name': 1,
            'image': 1,
            'votes' : 1,
        }).toArray();
        res.send({
             "build": mainList
        })
    })
    // axios.get("http://ldkndkfn"+ "/main/brand/ " +this.state.searchBrand)

    //====================BUILD: FILTER (PRICE) MAIN==========================//
    //READ
    app.get('/build/:price1/:price2', async function(req,res){        
        const db = MongoUtil.getDB();
        let mainList = await db.collection(MAIN_COLLECTION).find({
            'price' : {
                '$gte': parseInt(req.params.price1),
                '$lte': parseInt(req.params.price2)
            }
        }).project({
            'name': 1,
            'image': 1,
            'votes' : 1,
        }).toArray();
        res.send({
             "build": mainList
        })
    })
    //====================BUILD: INDIVIDUAL PAGE==========================//
    //READ
    app.get('/build/:_id', async function(req,res){        
        const db = MongoUtil.getDB();
        let mainList = await db.collection(MAIN_COLLECTION).find({
            'price' : {
                '$gte': parseInt(req.params.price1),
                '$lte': parseInt(req.params.price2)
            }
        }).project({
            'name': 1,
            'image': 1,
            'votes' : 1,
        }).toArray();
        res.send({
             "build": mainList
        })
    })
    //====================PARTS: CPU==========================//
    //READ
    app.get('/cpu', async function(req,res){
        const db = MongoUtil.getDB();
        let cpuRead = await db.collection(CPU_COLLECTION).find().toArray();
        res.json({
             "cpu":cpuRead
        })
    })
    //====================PARTS: GPU==========================//
    //READ
    app.get('/gpu', async function(req,res){
        const db = MongoUtil.getDB();
        let gpuRead = await db.collection(GPU_COLLECTION).find().toArray();
        res.json({
            "gpu" : gpuRead
        })
    })
    //====================PARTS: MOBO==========================//
    //READ
    app.get('/mobo', async function(req,res){
        const db = MongoUtil.getDB();
        let moboRead = await db.collection(MOBO_COLLECTION).find().toArray();
        res.json({
            "mobo" : moboRead
        })
    })
    //====================PARTS: RAM==========================//
    //READ
    app.get('/ram', async function(req,res){
        const db = MongoUtil.getDB();
        let ramRead = await db.collection(RAM_COLLECTION).find().toArray();
        res.json({
            "ram" : ramRead
        })
    })
}
main();

//LISTENT
app.listen(3000, function(){
    console.log("Server has started")
})