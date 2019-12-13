const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

//All authors route
router.get('/', async (req, res) =>{
    let searchOptions={}
    if (req.query.name != null && req.query.name !==''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        }) 
    }catch{
        res.redirect('/', {
            errorMessage: 'No authors found'
        })
    }
    // res.render('authors/index')
})
// New author route
router.get('/new', (req, res)=>{
    res.render('authors/new', {author: new Author()})    
})
// Create authors route
router.post('/', async (req, res)=>{
    const author = new Author({
        name:req.body.name
    })
    try {
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
        // res.redirect('authors')
    } catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        })
    }
}) 

router.get('/:id', async(req,res)=>{
    // res.send('Show Author ' + req.params.id)
    let books
    let author
    
    try{
        author = await Author.findById(req.params.id)
        books = await Book.find({author: author.id}).limit(6).exec()
        res.render("authors/show", {
                        author: author,
                        booksByAuthor: books })
    // }catch (err){
    }catch {
        // console.log(err)
        // if (author == null){console.log("Author == null")}
        // if (books == null){console.log("Books == null")}
        // if (err) console.log ("err ( "+ err + ")")
        res.redirect('/')
    }
})

router.get('/:id/edit', async(req,res)=>{
    // res.send('Edit Author '+ req.params.id)
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author})  
    }catch{
        // if(err) console.log(err)
        res.redirect('/authors')
    }
})

router.put('/:id',async (req,res)=>{
    let author
    try {
        author= await Author.findById(req.params.id)
        author.name=req.body.name
        author.save()
        res.redirect(`/authors/${author.id}`)
        // res.redirect('authors')
    } catch{
        if(author== null){
            // res.redirect('/', {errorMessage: 'Author not found'})
            res.redirect('/')
        }else{
            res.render('/authors/edit', {
                author: author,
                errorMessage: 'Error updating author'
        
            })
        }
    }
})
router.delete('/:id', async (req,res)=>{
    let author
    try {        
        author= await Author.findById(req.params.id)
        // console.log(req.params.id)
        await author.remove()        
        // console.log(author.name)
        res.redirect(`/authors`)
        // res.redirect('authors')        
    }catch{
        console.log("Catch fired up")
        if(author== null){
            // res.redirect('/', {errorMessage: 'Author not found'})
            console.log('Author == null')
            res.redirect('/')
        }else{
            console.log('Caught the author has books still')
            // res.redirect(`/authors/${author.id}`,{
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router