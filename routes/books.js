const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const fs = require('fs')
const path = require('path')
const uploadPath = path.join('public',Book.coverImageBasePath)
const imageMimeTypes= ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
// const upload = multer.diskStorage({
//     destination: function(req, file, callback){
//         callback(null, path.join(uploadPath))
//     }
//     // },
//     // filename: function(req,file, callback){
//     //     callback(null,file.originalname)
//     // }
// })
// var multerSingleUpload = multer({storage: upload})
//     // fileFilter: (req, file, callback) =>{
//     //     callback(null, imageMimeTypes.includes(file.mimetype))

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
router.post('/',  async (req, res)=>{
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })
    saveCover(book, req.body.cover)

    // saveCover(book, req.body.cover) 
    // console.log(book.imageCover == null)
    // console.log(book.imageCoverType)
    try{
        // console.log(book)
        const newBook = await book.save(function(err){
            if (err)console.log(err)
        })
        res.redirect('books/${newBook.id}')
        // res.redirect('books')
       
    }catch{
        //  if(err) console.log(err)
        renderNewPage(res, book, true)       
    }
}) 

// SHOW BOOK
router.get('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
                            .populate('author')
                            .exec()
        res.render('books/show',{book : book})
        
    } catch {
        res.redirect('/')
    }
})

// Edit Book route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch {        
        res.redirect('/')
    }    
    // res.send("edit book")
})

// Update Book route
router.put('/:id', async (req, res)=>{
    let book
    try {        
        // console.log("llego al put")
        book = await Book.findById(req.params.id)        
        book.title= req.body.title
        book.author= req.body.author
        book.publishDate= new Date(req.body.publishDate)
        book.pageCount= req.body.pageCount     
        book.description= req.body.description          
        if(req.body.cover != null && req.body.cover!=''){
            saveCover(book, req.body.cover)
        }    
        // console.log("llego al book save")
        await book.save()
        res.render("books/show", {book: book})
    } catch (err){
        // console.log(err)
        if(book != null){
            renderEditPage(res, book, tru)
        }else{
            res.redirect('/')
        }        
    }        
}) 

router.delete("/:id", async (req,res)=>{
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        if(book!=null){
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        }else {
            res.redirect('/')
        }
        
    }
})

// function removeBookCover(fileName){
//     fs.unlink(path.join(uploadPath, fileName),err=>{
//         if (err) console.error(err)
//     })

// }

async function renderNewPage(res, book, hasError = false){
    renderFormPage ( res,book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({})        
        const params = {        
            authors: authors,
            book: book
        }        
        if (form == 'edit'){
            if (hasError) params.errorMessage ='Error Editing Book. '
        }else{
            if (hasError) params.errorMessage ='Error Creating Book. '
        }
        // res.render(`/books/${form}`, params)
        res.render(`books/${form}`, params)
    } catch {
        // if (err) console.error(err)
        res.redirect('/books')
    }
}

async function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)){
    // console.log(cover.type)
    // console.log(imageMimeTypes)

    // if (imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}
module.exports = router