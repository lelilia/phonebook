require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')


const app = express()

app.use(express.json())
app.use(express.static('build'))


morgan.token('content', function (req) {
  const content = JSON.stringify({
    name: req.body.name,
    number: req.body.number
  })
  return content
})
app.use(morgan('tiny', {
  skip: function (req) { return req.method === 'POST' }
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', {
  skip: function (req) { return req.method !== 'POST' }
}))


app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

// GET: shows list of persons
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

// GET: shows number of entries and time stamp of request
app.get('/api/persons/info', (request, response, next) => {
  Person.find({})
    .then(persons => {
      const numberOfEntries = persons.length
      const dateOfRequest = new Date()
      const message = `
        <p>Phonebook has info for ${numberOfEntries} people </p>
        <p> ${dateOfRequest} </p>`
      response.send(message)
    })
    .catch(error => next(error))
})

// GET: shows single resource
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

// DELETE: delete single resource
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


// POST: add person
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const name = body.name
  const number = body.number

  if (!name) {
    return response.status(400).json({ error: 'name missing' })
  }
  else if (!number) {
    return response.status(400).json({ error: 'number is missing' })
  }
  const person = new Person({ name, number })
  person.save()
    .then(newPerson => {
      response.json(newPerson)
    })
    .catch(error => next(error))
})

// PUT: change person
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint ' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError' && request.method === 'PUT'){
    return response.status(400).send(({ error: 'number not valid' }))
  }
  else if (error.name === 'ValidationError'){
    return response.status(400).send({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})