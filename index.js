const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json());

const courses = [
    
    { id : 1 , name: 'course1'},
    { id : 2 , name: 'course2'},
    { id : 3, name: 'course3'},
    { id : 4 , name: 'course4'}

]

app.get('/', (req, res)=> {
    
    res.send('Hello Guys!');

});

app.get('/api/courses', (req, res) => {

    res.send(courses);

} )

app.get('/api/courses/:id', (req, res)=>{

    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given Id is not found')
    res.send(course);

})

app.post('/api/courses', (req, res) => {

    const {error} = courseValidate(req.body)
   
    if(error) {
        // bad request
        return res.status(400).send(error.details[0].message);
        
    }


    const course = {
        id : courses.length + 1,
        name : req.body.name
    };
    
    courses.push(course)
    res.send(course);
})

app.put('/api/courses/:id', (req, res) => {
   // look up the course 
   // if doesn't exit return 404 
   
   const course = courses.find(c => c.id === parseInt(req.params.id));
   if(!course) {
     return res.status(404).send('The course with the given Id is not found')
    
   }
   
   // validate 
   // if invalid, return 400
   const {error} = courseValidate(req.body)
   if(error) {
    // bad request
       return res.status(400).send(error.details[0].message);
   
   }

   // update the course
   // return the updated course to the client 

   course.name = req.body.name;
   res.send(course);
})

app.delete('/api/courses/:id', (req, res) => {
  // look up the course 
  //if it dosen't exist, return 404
  const course = courses.find(c => c.id === parseInt(req.params.id));
   if(!course) {
     return res.status(404).send('The course with the given Id is not found')
     
  }

  const index = courses.indexOf(course);
  courses.splice(index,1);
  res.send(course);

  // delete the course 
  // return the deleted course to the client

})


function courseValidate(course) {

    const schema = {
        name : Joi.string().min(3).required()
    }
    
    return Joi.validate(course, schema)    

}


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}...`));
