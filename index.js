const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');


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
    app.get('/:brand_name/build', async function(req,res){
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
    app.get('/:price1/:price2/build', async function(req,res){        
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
    app.post('/:id/individualbuild/comment', async function(req,res){
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
    //====================BUILD: INDIVIDUAL PAGE UPVOTE EDIT==========================//
    //UDATE (abit of details)
    app.patch('/:id/individualbuild/voteup', async function(req,res){
        try {
            const db = MongoUtil.getDB();
            let upvote = await db.collection(BUILD_COLLECTION).find({
                '_id': ObjectId(req.params.id)
            }).project({
                'votes': 1
            }).toArray();
            
            let updateVotes = upvote[0].votes + 1
            await db.collection(BUILD_COLLECTION).updateOne({
                '_id': ObjectId(req.params.id)
            },{
            '$set':{
                'votes': updateVotes,
            }
        })
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
    //====================BUILD: INDIVIDUAL PAGE CHANGE==========================//
    //READ
    app.get('/:id/:email/individualbuild', async function(req,res){
        
            const db = MongoUtil.getDB();
            let mainList = await db.collection(BUILD_COLLECTION).find({
                '_id' : ObjectId(req.params.id)
            }).project({
                'email' : 1
            }).toArray();

            if(mainList[0].email === req.params.email){
                res.send({
                    "message": true,
                })
            }
            else{
                res.send({
                    "message": false
                })
            }
    })
    //====================BUILD: NEW LISTING PARTS LOAD==========================//
    //READ
    app.get('/newbuild', async function(req,res){
        const db = MongoUtil.getDB();
        //get cpu details
        let cpuItem = await db.collection(CPU_COLLECTION).find({}).project({
            '_id': 1,
            'product_name': 1,
            'image': 1,
        }).toArray();
        //get gpu details
        let gpuItem = await db.collection(GPU_COLLECTION).find({}).project({
            '_id': 1,
            'product_name': 1,
            'image': 1,
        }).toArray();
        //get mobo details
        let moboItem = await db.collection(MOBO_COLLECTION).find({}).project({
            '_id': 1,
            'product_name': 1,
            'image': 1,
        }).toArray();
        //get mobo details
        let ramItem = await db.collection(RAM_COLLECTION).find({}).project({
            '_id': 1,
            'name': 1,
            'image': 1,
        }).toArray();

        res.send({
             "cpu" : cpuItem,
             "gpu" : gpuItem,
             "mobo" : moboItem,
             "ram" : ramItem,
        })
    })
    //====================BUILD: NEW LISTING PART AND FORM SEND==========================//
    //CREATE
    app.post('/newbuild', async function(req,res){
        try {
            const db = MongoUtil.getDB();
            let cpuList = await db.collection(CPU_COLLECTION).find({
                '_id': ObjectId(req.body.cpu)
            }).project({
                'brand' : 1,
                'price' : 1
            }).toArray();

            let gpuList = await db.collection(GPU_COLLECTION).find({
                '_id': ObjectId(req.body.gpu)
            }).project({
                'price' : 1
            }).toArray();

            let moboList = await db.collection(MOBO_COLLECTION).find({
                '_id': ObjectId(req.body.mobo)
            }).project({
                'price' : 1
            }).toArray();

            let ramList = await db.collection(RAM_COLLECTION).find({
                '_id': ObjectId(req.body.ram)
            }).project({
                'price' : 1
            }).toArray();

            let name = req.body.name
            let build_ease = req.body.build_ease
            let image = req.body.image
            let price = parseFloat(cpuList[0].price) + parseFloat(gpuList[0].price) + parseFloat(moboList[0].price) + parseFloat(ramList[0].price)
            let description = req.body.description
            let datetime = new Date().toLocaleString() //3/22/2022, 2:34:36 PM
            let votes = 0
            let cpu_brand = cpuList[0].brand
            let email = req.body.email

            //client side has id of individual part. pass over to backend fron dropdown list
            let parts = {
                'cpu_id': ObjectId(req.body.cpu),
                'gpu_id': ObjectId(req.body.gpu),
                'mobo_id': ObjectId(req.body.mobo),
                'ram_id': ObjectId(req.body.ram)
            }
            await db.collection(BUILD_COLLECTION).insertOne({
                name,
                build_ease,
                image,
                price,
                description,
                datetime,
                votes,
                cpu_brand,
                parts,
                email
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
app.listen(process.env.PORT, function(){
    console.log("Server has started")
})
