const express = require('express');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// connecting to mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/vidjot-dev',{
    
})
    .then(() => {
        console.log('MongoDB Conected..')
    })
    .catch(err => console.log(err));

// load idea model

require('./models/Idea');
const Idea = mongoose.model('ideas')

// handlebars middleware

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// body parser middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// method-override middleware

app.use(methodOverride('_method'));

// express-session middleware

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }))

// flash middleware

app.use(flash());

// globle variables

app.use(function(req,res,next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();

});


// index route

app.get('/' , (req,res) => {
    const title = 'welcome';
    res.render('index',{
        title:title
    });
});

// about route

app.get('/about', (req,res) => {
    res.render('about');
});

// idea index page

app.get('/ideas', (req,res) => {
    
    Idea.find({})
    .sort({date:'desc'})
    .then(ideas => {
        res.render('ideas/index',{
            ideas:ideas
        });
    });

});

// add idea form

app.get('/ideas/add', (req,res) => {
   
    res.render('ideas/add');
    
});

// edit idea form

app.get('/ideas/edit/:id', (req,res) => {
    Idea.findOne({
        _id:req.params.id
    })
     .then(idea => {
        res.render('ideas/edit',{
            idea:idea
        });
     });   
});


// idea process form

app.post('/ideas', (req,res) => {
   let errors = [];

   if(!req.body.title){
       errors.push({text:'Please add a title !'});
   }
   if(!req.body.details){
    errors.push({text:'Please add some details !'});
    }

    if(errors.length > 0){
        res.render('ideas/add', {
            errors:errors,
            title:req.body.title,
            details:req.body.details
        });
    }
    else{
       const newUser = {
           title:req.body.title,
           details:req.body.details
       }
       new Idea(newUser)
        .save()
        .then(idea =>{
            res.redirect('/ideas'); 
        })
    }
});

// edit form request
app.put('/ideas/:id', (req,res) => {
    Idea.findOne({
       _id:req.params.id 
    })
    .then(idea => {
        // new values
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save()
            .then(idea => {
                res.redirect('/ideas');
            })
    });
});

// delete idea
app.delete('/ideas/:id', (req,res) => {
    Idea.remove({_id: req.params.id})
    .then(() => {
        res.redirect('/ideas');
    });
});

const port = 5000;

app.listen(port, () => {
    console.log(`Server started at port no : ${port}`);
});