const express = require("express");
const router = express.Router();
//Posts
//Index
router.get("/posts" ,(req,res) =>{
    res.send("GET for posts")
})
//Show
router.get("/posts/:id" ,(req,res) =>{
    res.send("GET for posts")
})

//create
router.post("/posts" ,(req,res) =>{
    res.send("GET for posts")
})
//delete
router.delete("/posts/:id" ,(req,res) =>{
    res.send("GET for posts")
})
module.exports = router;
