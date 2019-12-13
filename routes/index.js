const express = require('express')
const router = express.Router()
const Book = require('../models/book')

router.get('/', async (req, res) => {
    let books
    try{
        books = await Book.find().sort({ createdAt: 'desc'}).limit(10).exec()
    }catch(err){
        if(err){
            console.log(err)
            books=[]
        }
    }
    // console.log(books)
    res.render('index', { books: books})
    
})

module.exports = router