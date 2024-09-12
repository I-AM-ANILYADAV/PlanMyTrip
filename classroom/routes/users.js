const express = require("express");
const router = express.Router();
//User
//Index
router.get("/" ,(req,res) =>{
    res.send("GET for users")
})
//Show
router.get("/:id" ,(req,res) =>{
    res.send("GET for users")
})

//create
router.post("/" ,(req,res) =>{
    res.send("GET for users")
})
//delete
router.delete("/:id" ,(req,res) =>{
    res.send("GET for users")
})
module.exports = router;