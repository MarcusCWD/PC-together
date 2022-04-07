const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const MongoUtil = require("./MongoUtil");

// SETUP
const app = express();

// enable JSON data processing
app.use(express.json());

// case sensitive
app.set("case sensitive routing", true);

// enable CORS
app.use(cors());

const BUILD_COLLECTION = "build";
const CPU_COLLECTION = "cpu";
const GPU_COLLECTION = "gpu";
const MOBO_COLLECTION = "mobo";
const RAM_COLLECTION = "ram";
const COMMENTS_COLLECTION = "comments";

//ALL ROUTE
async function main() {
  await MongoUtil.connect(process.env.MONGO_URI, "pc_together");

  //====================BUILD: MAIN LOAD==========================//
  //READ
  // main page, user only needs to see image, name and voted of listing
  app.get("/build", async function (req, res) {
    const db = MongoUtil.getDB();
    let mainList = await db
      .collection(BUILD_COLLECTION)
      .find({})
      .project({
        name: 1,
        image: 1,
        votes: 1,
        build_ease: 1,
        cpu_brand: 1,
        gpu_brand: 1,
        price: 1,
        parts: 1,
      })
      .toArray();
    //get cpu details
    let cpuItem = await db.collection(CPU_COLLECTION).find({}).toArray();
    //get gpu details
    let gpuItem = await db.collection(GPU_COLLECTION).find({}).toArray();
    res.send({
      mainList,
      cpuItem,
      gpuItem,
    });
  });
  //====================BUILD: FILTER (BRAND, PRICE) MAIN LOAD==========================//
  //READ
  app.get("/filter", async function (req, res) {
    const db = MongoUtil.getDB();
    let criteria = {};
    // if cpu have and gpu nothing and price nothing
    if (req.query.cpu_brand_name) {
      criteria = {
        cpu_brand: {
          $in: req.query.cpu_brand_name,
        },
      };
    }
    // if gpu have and cpu nothing and price nothing
    if (req.query.gpu_brand_name) {
      criteria = {
        gpu_brand: {
          $in: req.query.gpu_brand_name,
        },
      };
    }
    // if gpu have and cpu have and price nothing
    if (req.query.gpu_brand_name && req.query.cpu_brand_name) {
      criteria = {
        gpu_brand: {
          $in: req.query.gpu_brand_name,
        },
        cpu_brand: {
          $in: req.query.cpu_brand_name,
        },
      };
    }
    // if price have cpu nothing gpu nothing
    if (req.query.price_search) {
      if (parseInt(req.query.price_search) === 2000) {
        criteria = {
          price: {
            $gte: parseInt(req.query.price_search),
          },
        };
      } else {
        criteria = {
          price: {
            $gte: parseInt(req.query.price_search),
            $lt: parseInt(req.query.price_search) + 499,
          },
        };
      }
    }
    // if price have cpu have gpu nothing
    if (req.query.price_search && req.query.cpu_brand_name) {
      if (parseInt(req.query.price_search) === 2000) {
        criteria = {
          price: {
            $gte: parseInt(req.query.price_search),
          },
          cpu_brand: {
            $in: req.query.cpu_brand_name,
          },
        };
      } else {
        criteria = {
          price: {
            $gte: parseInt(req.query.price_search),
            $lt: parseInt(req.query.price_search) + 499,
          },
          cpu_brand: {
            $in: req.query.cpu_brand_name,
          },
        };
      }
    }
    // if price have cpu nothing gpu have
    if (req.query.price_search && req.query.gpu_brand_name) {
      if (parseInt(req.query.price_search) === 2000) {
        criteria = {
          price: {
            $gte: parseInt(req.query.price_search),
          },
          gpu_brand: {
            $in: req.query.gpu_brand_name,
          },
        };
      } else {
        criteria = {
          price: {
            $gte: parseInt(req.query.price_search),
            $lt: parseInt(req.query.price_search) + 499,
          },
          gpu_brand: {
            $in: req.query.gpu_brand_name,
          },
        };
      }
    }
    // if price have cpu have gpu have
    if (
      req.query.price_search &&
      req.query.cpu_brand_name &&
      req.query.gpu_brand_name
    ) {
      if (parseInt(req.query.price_search) === 2000) {
        criteria = {
          price: {
            $gte: parseInt(req.query.price_search),
          },
          cpu_brand: {
            $in: req.query.cpu_brand_name,
          },
          gpu_brand: {
            $in: req.query.gpu_brand_name,
          },
        };
      } else {
        criteria = {
          price: {
            $gte: parseInt(req.query.price_search),
            $lt: parseInt(req.query.price_search) + 499,
          },
          cpu_brand: {
            $in: req.query.cpu_brand_name,
          },
          gpu_brand: {
            $in: req.query.gpu_brand_name,
          },
        };
      }
    }

    //else all no have, find all without criteria

    let mainList = await db
      .collection(BUILD_COLLECTION)
      .find(criteria)
      .project({
        name: 1,
        image: 1,
        votes: 1,
        build_ease: 1,
        cpu_brand: 1,
        gpu_brand: 1,
        price: 1,
        parts: 1,
      })
      .toArray();
    criteria = {};
    let cpuItem = await db.collection(CPU_COLLECTION).find({}).toArray();
    let gpuItem = await db.collection(GPU_COLLECTION).find({}).toArray();
    res.send({
      mainList,
      cpuItem,
      gpuItem,
    });
  });
  // axios.get("http://ldkndkfn"+ "/main/brand/ " +this.state.searchBrand)

  //====================BUILD: INDIVIDUAL PAGE LOAD==========================//
  //READ
  app.get("/:id/individualbuild", async function (req, res) {
    const db = MongoUtil.getDB();
    //get main details of listing
    let mainList = await db
      .collection(BUILD_COLLECTION)
      .find({
        _id: ObjectId(req.params.id),
      })
      .project({
        _id: 1,
        name: 1,
        build_ease: 1,
        image: 1,
        price: 1,
        description: 1,
        datetime: 1,
        votes: 1,
        cpu_brand: 1,
        gpu_brand: 1,
        parts: 1,
      })
      .toArray();
    //get comments of listing
    let commentList = await db
      .collection(COMMENTS_COLLECTION)
      .find({
        build_id: ObjectId(req.params.id),
      })
      .toArray();
    //get cpu details
    let cpuItem = await db
      .collection(CPU_COLLECTION)
      .find({
        _id: mainList[0].parts.cpu_id,
      })
      .toArray();
    //get gpu details
    let gpuItem = await db
      .collection(GPU_COLLECTION)
      .find({
        _id: mainList[0].parts.gpu_id,
      })
      .toArray();
    //get mobo details
    let moboItem = await db
      .collection(MOBO_COLLECTION)
      .find({
        _id: mainList[0].parts.mobo_id,
      })
      .toArray();
    //get mobo details
    let ramItem = await db
      .collection(RAM_COLLECTION)
      .find({
        _id: mainList[0].parts.ram_id,
      })
      .toArray();

    res.send({
      mainList,
      commentList,
      cpuItem,
      gpuItem,
      moboItem,
      ramItem,
    });
  });
  //====================BUILD: INDIVIDUAL PAGE COMMENTS SEND==========================//
  //CREATE
  app.post("/:id/comment", async function (req, res) {
    try {
      let name = req.body.name;
      let comment = req.body.comment;
      let build_id = ObjectId(req.params.id);
      let email = req.body.email;
      let datetime = new Date().toLocaleString(); //3/22/2022, 2:34:36 PM

      let errorFlag = false;
      // no input name
      if (!name) {
        errorFlag = true;
      }
      // no email, no @, no .com
      if (!email || !email.includes("@") || !email.includes(".com")) {
        errorFlag = true;
      }
      // comment is less than 10 char long
      if (!comment || comment.length < 10) {
        errorFlag = true;
      }
      if (errorFlag === false) {
        const db = MongoUtil.getDB();
        await db.collection(COMMENTS_COLLECTION).insertOne({
          name, //need
          comment, //need
          build_id, //no need
          email, //need
          datetime, //no need
        });
        res.status(200);
        res.json({
          message: "The record has been added successfully",
        });
      } else {
        res.status(406);
        res.json({
          message: "Invalid submission",
        });
      }
    } catch (e) {
      res.status(500);
      res.json({
        message: "Internal server error. Please contact administrator",
      });
      console.log(e);
    }
  });
  //====================BUILD: INDIVIDUAL PAGE UPVOTE EDIT==========================//
  //UDATE (abit of details)
  app.patch("/:id/voteup", async function (req, res) {
    try {
      const db = MongoUtil.getDB();
      let upvote = await db
        .collection(BUILD_COLLECTION)
        .find({
          _id: ObjectId(req.params.id),
        })
        .project({
          votes: 1,
        })
        .toArray();

      let updateVotes = upvote[0].votes + 1;
      await db.collection(BUILD_COLLECTION).updateOne(
        {
          _id: ObjectId(req.params.id),
        },
        {
          $set: {
            votes: updateVotes,
          },
        }
      );
      res.status(200);
      res.json({
        message: "The record has been added successfully",
      });
    } catch (e) {
      res.status(500);
      res.json({
        message: "Internal server error. Please contact administrator",
      });
      console.log(e);
    }
  });
  //====================BUILD: INDIVIDUAL PAGE CHANGE(EMAIL VERIFICATION)==========================//
  // run the route upon user pressing edit button
  // if the user as entered correct email via query,
  // confirmation will be send back to client as true
  // else false
  app.get("/:id/:email/email", async function (req, res) {
    console.log("activated this route?");
    const db = MongoUtil.getDB();
    //get main details of listing
    let mainList = await db
      .collection(BUILD_COLLECTION)
      .find({
        _id: ObjectId(req.params.id),
      })
      .project({
        email: 1,
      })
      .toArray();
    if (mainList[0].email === req.params.email) {
      res.send({
        email_check: true,
      });
    } else {
      res.send({
        email_check: false,
      });
    }
  });
  //====================BUILD: INDIVIDUAL PAGE CHANGE(EDIT LISTING)==========================//
  //UPDATE
  app.put("/:id/edit", async function (req, res) {
    try {
      const db = MongoUtil.getDB();
      let mainList = await db
        .collection(BUILD_COLLECTION)
        .find({
          _id: ObjectId(req.params.id),
        })
        .project({
          datetime: 1,
          votes: 1,
        })
        .toArray();
      let cpuList = await db
        .collection(CPU_COLLECTION)
        .find({
          _id: ObjectId(req.body.cpu),
        })
        .project({
          brand: 1,
          price: 1,
        })
        .toArray();

      let gpuList = await db
        .collection(GPU_COLLECTION)
        .find({
          _id: ObjectId(req.body.gpu),
        })
        .project({
          brand: 1,
          price: 1,
        })
        .toArray();

      let moboList = await db
        .collection(MOBO_COLLECTION)
        .find({
          _id: ObjectId(req.body.mobo),
        })
        .project({
          price: 1,
        })
        .toArray();

      let ramList = await db
        .collection(RAM_COLLECTION)
        .find({
          _id: ObjectId(req.body.ram),
        })
        .project({
          price: 1,
        })
        .toArray();

      let name = req.body.name;
      let build_ease = req.body.build_ease;
      let image = req.body.image;
      let price =
        parseFloat(cpuList[0].price) +
        parseFloat(gpuList[0].price) +
        parseFloat(moboList[0].price) +
        parseFloat(ramList[0].price);
      let description = req.body.description;
      let cpu_brand = cpuList[0].brand;
      let gpu_brand = gpuList[0].brand;
      let datetime = mainList[0].datetime;
      let votes = mainList[0].votes;
      let parts = {
        cpu_id: ObjectId(req.body.cpu),
        gpu_id: ObjectId(req.body.gpu),
        mobo_id: ObjectId(req.body.mobo),
        ram_id: ObjectId(req.body.ram),
      };
      await db.collection(BUILD_COLLECTION).updateOne(
        {
          _id: ObjectId(req.params.id),
        },
        {
          $set: {
            name, //need
            build_ease, //need
            image, //need
            price, //no need
            description, //need
            datetime, //no need
            votes, //no need
            cpu_brand, // no need
            gpu_brand, // no need
            parts, // need
          },
        }
      );
      res.status(200);
      res.json({
        message: "The record has been edited successfully",
      });
    } catch (e) {
      res.status(500);
      res.json({
        message: "Internal server error. Please contact administrator",
      });
      console.log(e);
    }
  });
  //====================BUILD: INDIVIDUAL PAGE CHANGE(DELETE LISTING)==========================//
  //DESTROY
  app.delete("/:id/delete", async function (req, res) {
    console.log("hello did delete route activated?");
    await MongoUtil.getDB()
      .collection(BUILD_COLLECTION)
      .deleteOne({
        _id: ObjectId(req.params.id),
      });
    await MongoUtil.getDB()
      .collection(COMMENTS_COLLECTION)
      .deleteOne({
        build: ObjectId(req.params.id),
      });
    res.status(200);
    res.json({
      message: "The document has been deleted",
    });
  });
  //====================BUILD: NEW LISTING PARTS LOAD==========================//
  //READ
  app.get("/newbuild", async function (req, res) {
    const db = MongoUtil.getDB();
    //get cpu details
    let cpuItem = await db
      .collection(CPU_COLLECTION)
      .find({})
      .project({
        _id: 1,
        product_name: 1,
        image: 1,
      })
      .toArray();
    //get gpu details
    let gpuItem = await db
      .collection(GPU_COLLECTION)
      .find({})
      .project({
        _id: 1,
        product_name: 1,
        image: 1,
      })
      .toArray();
    //get mobo details
    let moboItem = await db
      .collection(MOBO_COLLECTION)
      .find({})
      .project({
        _id: 1,
        product_name: 1,
        image: 1,
      })
      .toArray();
    //get mobo details
    let ramItem = await db
      .collection(RAM_COLLECTION)
      .find({})
      .project({
        _id: 1,
        product_name: 1,
        image: 1,
      })
      .toArray();

    res.send({
      cpuItem,
      gpuItem,
      moboItem,
      ramItem,
    });
  });
  //====================BUILD: NEW LISTING PART AND FORM SEND==========================//
  //CREATE
  app.post("/newbuild", async function (req, res) {
    try {
      const db = MongoUtil.getDB();
      let cpuList = await db
        .collection(CPU_COLLECTION)
        .find({
          _id: ObjectId(req.body.cpu),
        })
        .project({
          brand: 1,
          price: 1,
        })
        .toArray();

      let gpuList = await db
        .collection(GPU_COLLECTION)
        .find({
          _id: ObjectId(req.body.gpu),
        })
        .project({
          price: 1,
        })
        .toArray();

      let moboList = await db
        .collection(MOBO_COLLECTION)
        .find({
          _id: ObjectId(req.body.mobo),
        })
        .project({
          price: 1,
        })
        .toArray();

      let ramList = await db
        .collection(RAM_COLLECTION)
        .find({
          _id: ObjectId(req.body.ram),
        })
        .project({
          price: 1,
        })
        .toArray();

      let name = req.body.name;
      let build_ease = req.body.build_ease;
      let image = req.body.image;
      let price =
        parseFloat(cpuList[0].price) +
        parseFloat(gpuList[0].price) +
        parseFloat(moboList[0].price) +
        parseFloat(ramList[0].price);
      let description = req.body.description;
      let datetime = new Date(); //3/22/2022, 2:34:36 PM
      let votes = 0;
      let cpu_brand = cpuList[0].brand;
      let gpu_brand = gpuList[0].brand;
      let email = req.body.email;

      //client side has id of individual part. pass over to backend fron dropdown list
      let parts = {
        cpu_id: ObjectId(req.body.cpu),
        gpu_id: ObjectId(req.body.gpu),
        mobo_id: ObjectId(req.body.mobo),
        ram_id: ObjectId(req.body.ram),
      };

      let errorFlag = false;
      // no build name or lenth is less than 5 char
      if (!name || name.length < 5) {
        errorFlag = true;
      }
      if (
        !image ||
        (!image.includes(".com") &&
          !(
            image.includes(".jpg") ||
            image.includes(".png") ||
            image.includes(".gif") ||
            image.includes(".jpeg") ||
            image.includes(".svg") ||
            image.includes(".webp") ||
            image.includes(".bmp")
          ))
      ) {
        errorFlag = true;
      }
      // no email, no @, no .com
      if (!email || !email.includes("@") || !email.includes(".com")) {
        errorFlag = true;
      }
      // description is less than 10 char long
      if (!description || description.length < 10) {
        errorFlag = true;
      }
      if (errorFlag === false) {
        await db.collection(BUILD_COLLECTION).insertOne({
          name, //need
          build_ease, //need
          image, //need
          price, //no  need
          description, //need
          datetime, //no need
          votes, //no need
          cpu_brand, //no need
          gpu_brand, //no need
          parts, // need as an object with id
          email, // need
        });
        res.status(200);
        res.json({
          message: "The record has been added successfully",
        });
      } else {
        res.status(406);
        res.json({
          message: "Invalid submission",
        });
      }
    } catch (e) {
      res.status(500);
      res.json({
        message: "Internal server error. Please contact administrator",
      });
      console.log(e);
    }
  });

  //====================PARTS: CPU==========================//
  //READ
  app.get("/cpu", async function (req, res) {
    const db = MongoUtil.getDB();
    let cpuRead = await db.collection(CPU_COLLECTION).find().toArray();
    res.send({
      cpuRead,
    });
  });
  //====================PARTS: GPU==========================//
  //READ
  app.get("/gpu", async function (req, res) {
    const db = MongoUtil.getDB();
    let gpuRead = await db.collection(GPU_COLLECTION).find().toArray();
    res.send({
      gpuRead,
    });
  });
  //====================PARTS: MOBO==========================//
  //READ
  app.get("/mobo", async function (req, res) {
    const db = MongoUtil.getDB();
    let moboRead = await db.collection(MOBO_COLLECTION).find().toArray();
    res.send({
      moboRead,
    });
  });
  //====================PARTS: RAM==========================//
  //READ
  app.get("/ram", async function (req, res) {
    const db = MongoUtil.getDB();
    let ramRead = await db.collection(RAM_COLLECTION).find().toArray();
    res.send({
      ramRead,
    });
  });
}
main();
// console.log(process.env.DBNAME)
//LISTENT
app.listen(process.env.PORT || 3000, function () {
  console.log("Server has started");
});
