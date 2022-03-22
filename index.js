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

const BUILD_COLLECTION="build"
const CPU_COLLECTION="cpu";
const GPU_COLLECTION="gpu";
const MOBO_COLLECTION="mobo";
const RAM_COLLECTION="ram";
const COMMENTS_COLLECTION="comments";

//ALL ROUTE
async function main(){
    await MongoUtil.connect(process.env.MONGO_URI, "pc_together");

    //====================BUILD: MAIN LOAD==========================//
    //READ
    // main page, user only needs to see image, name and voted of listing
    app.get('/build', async function(req,res){
        const db = MongoUtil.getDB();
        let mainList = await db.collection(BUILD_COLLECTION).find({
        }).project({
            'name': 1,
            'image': 1,
            'vote' : 1,
        }).toArray();
        res.json({
             "all-build":mainList
        })
    })
    
    //====================BUILD: FILTER (BRAND) MAIN LOAD==========================//
    //READ
    app.get('/build/:brand_name', async function(req,res){

        const db = MongoUtil.getDB();
        let mainList = await db.collection(BUILD_COLLECTION).find({
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
             "brand-build": mainList
        })
    })
    // axios.get("http://ldkndkfn"+ "/main/brand/ " +this.state.searchBrand)

    //====================BUILD: FILTER (PRICE) MAIN LOAD==========================//
    //READ
    app.get('/build/:price1/:price2', async function(req,res){        
        const db = MongoUtil.getDB();
        let mainList = await db.collection(BUILD_COLLECTION).find({
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
             "price-build": mainList
        })
    })
    //====================BUILD: INDIVIDUAL PAGE LOAD==========================//
    //READ
    app.get('/:id/individualbuild', async function(req,res){
        const db = MongoUtil.getDB();
        //get main details of listing
        let mainList = await db.collection(BUILD_COLLECTION).find({
            '_id': ObjectId(req.params.id)
        }).toArray();
        //get comments of listing
        let commentList = await db.collection(COMMENTS_COLLECTION).find({
            'build_id': ObjectId(req.params.id)
        }).toArray();
        //get cpu details
        let cpuItem = await db.collection(CPU_COLLECTION).find({
            '_id': mainList[0].parts.cpu_id
        }).toArray();
        //get gpu details
        let gpuItem = await db.collection(GPU_COLLECTION).find({
            '_id': mainList[0].parts.gpu_id
        }).toArray();
        //get mobo details
        let moboItem = await db.collection(MOBO_COLLECTION).find({
            '_id': mainList[0].parts.mobo_id
        }).toArray();
        //get mobo details
        let ramItem = await db.collection(RAM_COLLECTION).find({
            '_id': mainList[0].parts.ram_id
        }).toArray();
    

        res.send({
            "build" : mainList,
            "build-comments" : commentList,
            "build-cpu" : cpuItem,
            "build-gpu" : gpuItem,
            "build-mobo" : moboItem,
            "build-ram" : ramItem
        })
    })
    //====================BUILD: INDIVIDUAL PAGE COMMENTS SEND==========================//
    //CREATE
    app.post('/:id/individualbuild', async function(req,res){
        try {
        
        let name = req.body.name
        let comment = req.body.comment
        let build_id = ObjectId(req.params.id)
        let email = req.body.email
        let datetime = new Date().toLocaleString(); //3/22/2022, 2:34:36 PM

        const db = MongoUtil.getDB();
        await db.collection(COMMENTS_COLLECTION).insertOne({
            name,
            comment,
            build_id,
            email,
            datetime
        });
        res.status(200);
        res.json({
            'message':'The record has been added successfully'
        })
        } catch (e){
            res.status(500);
            res.json({
                'message':"Internal server error. Please contact administrator"
            })
            console.log(e);
        }
    })
    //====================PARTS: CPU==========================//
    //READ
    app.get('/cpu', async function(req,res){
        const db = MongoUtil.getDB();
        let cpuRead = await db.collection(CPU_COLLECTION).find().toArray();
        res.send({
             "cpu":cpuRead
        })
    })
    //====================PARTS: GPU==========================//
    //READ
    app.get('/gpu', async function(req,res){
        const db = MongoUtil.getDB();
        let gpuRead = await db.collection(GPU_COLLECTION).find().toArray();
        res.send({
            "gpu" : gpuRead
        })
    })
    //====================PARTS: MOBO==========================//
    //READ
    app.get('/mobo', async function(req,res){
        const db = MongoUtil.getDB();
        let moboRead = await db.collection(MOBO_COLLECTION).find().toArray();
        res.send({
            "mobo" : moboRead
        })
    })
    //====================PARTS: RAM==========================//
    //READ
    app.get('/ram', async function(req,res){
        const db = MongoUtil.getDB();
        let ramRead = await db.collection(RAM_COLLECTION).find().toArray();
        res.send({
            "ram" : ramRead
        })
    })
}
main();

//LISTENT
app.listen(3000, function(){
    console.log("Server has started")
})