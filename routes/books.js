const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const uploadPath = path.join('public',Book.coverImageBasePath)
const imageMimeTypes= ['images/jpeg', 'images/png', 'images/gif']
const upload = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, path.join(uploadPath))
    }
    // },
    // filename: function(req,file, callback){
    //     callback(null,file.originalname)
    // }
})
var multerSingleUpload = multer({storage: upload})
    // fileFilter: (req, file, callback) =>{
    //     callback(null, imageMimeTypes.includes(file.mimetype))

//All Books route
router.get('/', async (req, res) =>{
    // res.send('All Books')
    let query = Book.find()
    if(req.query.title != null && req.query.title !=''){
        // console.log('Title')
        query = query.regex('title', new RegExp(req.query.title,'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore !=''){
        // console.log('publishedBefore: '+req.query.publishedBefore)
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter !=''){
        // console.log('publishedAfter: '+req.query.publishedAfter)
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    //  console.log(query)
    try{
        // const books = await Book.find({})
        const books = await query.exec()
            res.render('books/index',{
            books:books,
            searchOptions: req.query
        })
    }catch(err){
        // console.log(err)
        res.redirect('/')
    }
})
// New Book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})
// Create Book route
// router.post('/', upload.single('cover'), async (req, res)=>{
 router.post('/', multerSingleUpload.single('cover'), async (req, res)=>{
    // console.log(req.file)
    // console.log(upload.single('cover'))
    const fileName= req.file != null? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    try{
        // console.log(book)
        const newBook = await book.save()
        // res.redirect('books/${newBook.id}')
        res.redirect('books')
    }catch{
        if (book.coverImageName !== null){
            removeBookCover(book.coverImageName)
        }        
        renderNewPage(res, book, true)
    }
}) 

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName),err=>{
        if (err) console.error(err)
    })

}

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {        
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage ='Error Creating Book. '
        res.render('books/new', params)
    } catch {
        if (err) console.error(err)
        res.redirect('/books')
    }
}

module.exports = router