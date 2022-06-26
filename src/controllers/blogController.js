const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel")
const { default: isBoolean } = require("validator/lib/isBoolean")
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


const createBlog = async function (req, res) {
  try {
    let token = req.headers["X-Api-Key"]
    if (!token) token = req.headers["x-api-key"]
    if (!token) return res.status(404).send({ status: false, msg: "token must be present" })
    let decodedToken = jwt.verify(token, 'project-blog')
    if (!decodedToken) return res.status(400).send({ status: false, msg: "token is not valid" }) 
    let authorToBeModified = req.body.authorId
    //userId for the logged-in user
    let authorLoggedIn = decodedToken.authorId
    //userId comparision to check if the logged-in user is requesting for their own data
    if (authorToBeModified != authorLoggedIn) return res.status(401).send({ status: false, msg: 'you are not authorised, login with correct user id or password' })
    let receivedData = req.body
    //title is mandatory
    if (!receivedData.title) { return res.status(400).send({ status: false, msg: "Title is missing" }) }
    //if title is present then please check
    if (receivedData.title) {
      if (receivedData.title.trim().length == 0) return res.status(400).send({ status: false, msg: "Empty space is not allowed" })
      if (!isNaN(receivedData.title)) { return res.status(400).send({ status: false, msg: "Title can not be a number only" }) }
      let titleTrim = /^[^ ][\w\W ]*[^ ]/
      if (!titleTrim.test(receivedData.title)) { return res.status(400).send({ status: false, msg: "Title have white space at begining or end" }) }
    }
    //body is mandatory
    if (!receivedData.body) { return res.status(400).send({ status: false, msg: "body is missing" }) }
    //if body is present then please check
    if (receivedData.body) {
      if (receivedData.body.trim().length == 0) return res.status(400).send({ status: false, msg: "Empty space is not allowed" })
      if (!isNaN(receivedData.body)) { return res.status(400).send({ status: false, msg: "Body can not be a number only" }) }
      let bodyValidation = /^[^ ][\w\W ]*[^ ]/
      if (!bodyValidation.test(receivedData.body)) { return res.status(400).send({ status: false, msg: "body have white space at begining or end" }) }
    }
    //catagory is mandatory
    if (!receivedData.category) { return res.status(400).send({ status: false, msg: "category is missing" }) }

    if (receivedData.category) {
      if (typeof receivedData.category != "object") { res.status(400).send({ status: "false", msg: "Category should be in form of Array" }) }
      if (!isNaN(receivedData.category)) { return res.status(400).send({ status: false, msg: "category can not be number only" }) }
      let Validation = /^#?[a-zA-Z0-9]+/gm
      if (!Validation.test(receivedData.category)) { return res.status(400).send({ status: "false", msg: "Category can't contain empty values" }) }
      let flag;
      if (Validation) {
        for (let i = 0; i < receivedData.category.length; i++) {
          if (receivedData.category[i].trim().length === 0) {
            flag = "true"
            break;
          }
        }
      }
      if (flag === "true") { return res.status(400).send({ status: "false", msg: "Category can't contain empty values after first value" }) }
    }


    if (receivedData.subCategory) {
      if (typeof receivedData.subCategory != "object") { return res.status(400).send({ status: "false", msg: "Sub Category should be in form of Array" }) }
      if (!isNaN(receivedData.subCategory)) { return res.status(400).send({ status: false, msg: "subCategory can not be number only" }) }
      let Validation = /^#?[a-zA-Z0-9]+/gm
      if (!Validation.test(receivedData.subCategory)) { return res.status(400).send({ status: "false", msg: "Sub Category can't contain empty values" }) }
      let flag;
      if (Validation) {
        for (let i = 0; i < receivedData.subCategory.length; i++) {
          if (receivedData.subCategory[i].trim().length === 0) {
            flag = "true"
            break;
          }
        }
      }
      if (flag === "true") { return res.status(400).send({ status: "false", msg: "Sub Category can't contain empty values after first value" }) }
    }

    if (receivedData.tags) {
      if (typeof receivedData.tags != "object") { return res.status(400).send({ status: "false", msg: "Tags should be in form of Array" }) }
      if (!isNaN(receivedData.tags)) { return res.status(400).send({ status: false, msg: "tags should not be number only" }) }
      let tagValidation = /^#?[a-zA-Z0-9]+/gm
      if (!tagValidation.test(receivedData.tags)) { return res.status(400).send({ status: "false", msg: "Tags can't contain empty values" }) }
      let flag;
      if (tagValidation) {
        for (let i = 0; i < receivedData.tags.length; i++) {
          if (receivedData.tags[i].trim().length === 0) {
            flag = "true"
            break;
          }
        }
      }
      if (flag === "true") { return res.status(400).send({ status: "false", msg: "Tags can't contain empty values after first value" }) }
    }

    if (!isBoolean(receivedData.isDeleted)) { return res.status(400).send({ status: false, msg: "IsDeleted should have only boolean value" }) }
    if (!isNaN(receivedData.isDeleted)) { return res.status(400).send({ status: false, msg: "numbers are not a boolean value except 1 or 0" }) }
    if (!isBoolean(receivedData.isPublished)) { return res.status(400).send({ status: false, msg: "IsPublished should have only boolean value" }) }
    if (!isNaN(receivedData.isPublushed)) { return res.status(400).send({ status: false, msg: "numbers are not a boolean value except 1 or 0" }) }
    //authorId is mandatory
    if (!receivedData.authorId) { return res.status(400).send({ status: false, msg: "author id is missing" }) }
    //author id validation check
    if (receivedData.authorId) {
      let authorid = receivedData.authorId
      if (!mongoose.isValidObjectId(authorId))
        return res.send({ msg: "Enter valid object Id" })
      let authorId = await authorModel.findById({ _id: authorid })
      if (!authorId) { return res.status(400).send("Invalid author id") }
    }
    //once all condition sutisfied successfully then data will be created
    let createdBlogData = await blogModel.create(receivedData)
    res.status(201).send({ status: true, data: createdBlogData })
  }
  catch (err) {
    res.status(500).send({ msg: "Error", error: err.message })
  }
}

const getBlogData = async function (req, res) {
  try {
    let token = req.headers["X-Api-Key"]
    if (!token) token = req.headers["x-api-key"]
    if (!token) return res.status(404).send({ status: false, msg: "token must be present" })
    let decodedToken = jwt.verify(token, 'project-blog')
    if (!decodedToken) return res.status(400).send({ status: false, msg: "token is not valid" })
    let blogData = await blogModel.findOne({
      $or: [{ authorId: req.query.authorId }, { tags: req.query.tags }, { catagory: req.query.catagory }, { subCatagory: req.query.subCatagory }]}).select({authorId:1,_id:0})
    if(!blogData){return res.status(400).send({status:false, msg:"Invalid request"})}  
    let authorToBeModified = blogData["authorId"].valueOf()
    //userId for the logged-in user
    let authorLoggedIn = decodedToken.authorId
    //userId comparision to check if the logged-in user is requesting for their own data
    if (authorToBeModified != authorLoggedIn) return res.status(401).send({ status: false, msg: 'you are not authorised, login with correct user id or password' })
    let spaceIn = Object.keys(req.query)
    if (!spaceIn[00].trim()) { }
    let authorId = req.query.authorId
    if (authorId) {
      let savedAuthorData = await authorModel.findById({ _id: authorId })
      if (!savedAuthorData) return res.status(400).send({ status: false, msg: "invalid author id" })
    }
    let savedBlogData = await blogModel.find({
       isDeleted: false, isPublished: true, $or: [{ authorId: authorId }, { tags: req.query.tags }, { catagory: req.query.catagory }, { subCatagory: req.query.subCatagory }] })
    // when no one data exits
    if (savedBlogData.length == 0) { return res.status(404).send({ status: false, msg: "Data not founds" }) }
    res.status(200).send({ status: true, data: savedBlogData })
  } catch (err) {
    res.status(500).send({ msg: "Error", error: err.message })
  }
}

//put Api
const updateBlog = async function (req, res) {
  try {

    let token = req.headers["X-Api-Key"]
    if (!token) token = req.headers["x-api-key"]

    if (!token) return res.status(404).send({ status: false, msg: "Token must be present" })
    let decodedToken = jwt.verify(token, 'project-blog')
    if (!decodedToken) return res.status(400).send({ status: false, msg: "Token is not valid" })

    let id = req.params.blogId
    if (!mongoose.isValidObjectId(id))
      return res.send({ msg: "Enter valid object Id" })
    if (req.params) {
      let blogToBeModified = id

      let IsAvailable = await blogModel.findById(blogToBeModified).select({ authorId: 1, _id: 0 })
      if (!IsAvailable) { return res.status(404).send({ status: false, msg: "No blog with this Id exist" }) }
        let authorLoggedIn = decodedToken.authorId
        if (IsAvailable["authorId"].valueOf() != authorLoggedIn) return res.status(400).send({ status: false, msg: 'Author logged is not allowed to modify the requested users data' })  
    }
    let blog = await blogModel.find({ _id: id, isDeleted: false })
    if (blog.length == 0) {
      return res.status(404).send({ status: false, msg: "Document has been deleted" })
    }

    let title = req.body.title
    let titleValidation = /^[-a-z0-9,\/()&:. ]*[a-z][-a-z0-9,\/()&:. ]*$/i
    if (!titleValidation.test(title)) { return res.status(400).send({ status: false, msg: "Invalid title" }) }

    let body = req.body.body
    let bodyValidation = /^[-a-z0-9,\/()&:. ]*[a-z][-a-z0-9,\/()&:. ]*$/i
    if (!bodyValidation.test(body)) { return res.status(400).send({ status: false, msg: "Invalid body format" }) }

    let tags = req.body.tags
    if (tags) {
      if (typeof tags != "object") { return res.status(400).send({ status: false, msg: "Tags should be in form of Array" }) }
      let tagValidation = /^#?[a-zA-Z0-9]+/gm
      if (!tagValidation.test(tags)) { return res.status(400).send({ status: false, msg: "Invalid tags" }) }
      let flag;
      if (tagValidation) {
        for (let i = 0; i < tags.length; i++) {
          if (tags[i].trim().length === 0) {
            flag = "true"
            break;
          }
        }
      }
      if (flag === "true") { return res.status(400).send({ status: false, msg: "Tags can't contain empty values" }) }
    }


    let subcategory = req.body.subcategory
      if (typeof subcategory != "object") { res.status(400).send({ status: false, msg: "Subcategories should be in form of Array" }) }
      let subcategoryValidation = /^#?[a-zA-Z0-9]+/gm
      if (!subcategoryValidation.test(subcategory)) { return res.status(400).send({ status: false, msg: "Invalid subcategory" }) }
      let flag;
      if (subcategoryValidation) {
        for (let i = 0; i < tags.length; i++) {
          if (subcategory[i].trim().length === 0) {
            flag = "true"
            break;
          }
        }
      }
      if (flag === "true") { return res.status(400).send({ status: false, msg: "Subcategory can't contain empty values" }) }
    
    let updateData = await blogModel.findOneAndUpdate({ "_id": id }, {
      $set: {
        title: title,
        body: body,
        publishedAt: new Date(),
        isPublished: true
      }
    })

    let updatedData = await blogModel.findOneAndUpdate({ "_id": id },
      { $push: { tags: tags, subcategory: subcategory } }, { new: true })
    res.status(200).send({ status: true, data: updatedData })
  }
  catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: "", error: err.message })
  }

}
//Delete api
const deleteByParams = async function (req, res) {
  try {
    let token = req.headers["X-Api-Key"]
    if (!token) token = req.headers["x-api-key"]
    if (!token) return res.status(404).send({ status: false, msg: "token must be present" })
    let decodedToken = jwt.verify(token, 'project-blog')
    if (!decodedToken) return res.status(400).send({ status: false, msg: "token is not valid" })
    
    let blogId = req.params.blogId
    if (!mongoose.isValidObjectId(blogId)){
      return res.send({ msg: "Enter valid object Id" })
    }
      let blogToBeModified = blogId
      let authorLoggedIn = decodedToken.authorId
      //finding Author id
      let IsAvailable = await blogModel.findById(blogToBeModified).select({ authorId: 1, _id: 0 })
      if (!IsAvailable) { return res.status(404).send({ status: false, msg: "No blog with this Id exist" }) }
      if (IsAvailable["authorId"].valueOf() != authorLoggedIn){ return res.status(400).send({
         status: false, msg: 'Author logged is not allowed to modify the requested users data' })}
      let deletedData = await blogModel.findOneAndUpdate({ _id: blogId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, {
        new: true
      })
      if (deletedData == null) { return res.status(404).send({ status: false, msg: "data not found" }) }
      res.status(200).send(deletedData)
  }
  catch (err) {
    res.status(500).send({ msg: "Error", error: err.message })
  }
}

const deleteByQueryParams = async function (req, res) {
  try {
    let spaceIn = Object.keys(req.query)
    if (!spaceIn[00].trim()) { }
    let authorid = req.query.authorId
    //validate author id
    if (authorid) {
      if (!mongoose.isValidObjectId(authorid)){
        return res.send({ msg: "Enter valid object Id" })}
      let savedBlogData = await authorModel.findById({ _id: authorid })
      if (!savedBlogData) { return res.status(400).send({ status: false, msg: "author id does not exits" }) }
    }
    let token = req.headers["X-Api-Key"]
    if (!token) token = req.headers["x-api-key"]
    if (!token) return res.status(404).send({ status: false, msg: "token must be present" })
    let decodedToken = jwt.verify(token, 'project-blog')
    if (!decodedToken) return res.status(400).send({ status: false, msg: "token is not valid" })
    let blogData = await blogModel.findOne({
       $or: [{ category: req.query.catagory}, { authorId: req.query.authorid }, { tags:req.query.tags}, { isPublished: false }]}).select({authorId:1,_id:0})
    if(!blogData){return res.status(400).send({status:false, msg:"invalid request"})}
    let authorToBeModifiedByQuery = blogData["authorId"].valueOf()
   // userId for the logged-in user
    let authorLoggedIn = decodedToken.authorId
   // userId comparision to check if the logged-in user is requesting for their own data
    if (authorToBeModifiedByQuery != authorLoggedIn) return res.status(401).send({ status: false, msg: 'you are not authorised, login with correct user id or password' })
//deletion process
    let deletedData = await blogModel.findOneAndUpdate(
      {
        isDeleted: false, $or: [{ category: req.query.catagory}, { authorId: authorid }, { tags:req.query.tags}, { isPublished: false }]
      }, { isDeleted: true, deletedAt: new Date() }, { new: true })
    //if there is no data then it will retun an error
    if (!deletedData) { return res.status(400).send({ status: false, msg: "Data  has been already deleted" }) }
    res.status(200).send(deletedData)
    
  }
  catch (err) {
    return res.status(500).send({ msg: "error", error: err.message })
  }
}
module.exports.createBlog = createBlog;
module.exports.getBlogData = getBlogData;
module.exports.updateBlog = updateBlog;
module.exports.deleteByParams = deleteByParams;
module.exports.deleteByQueryParams = deleteByQueryParams;

