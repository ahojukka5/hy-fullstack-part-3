const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const morgan = require('morgan')
morgan.token('content', function content(request) {
  return JSON.stringify(request.body)
})
const morganSetup = morgan(
  ':method :url :status :res[content-length] - :response-time ms :content'
)
app.use(morganSetup)

const cors = require('cors')
app.use(cors())

const Person = require('./models/person')

// let persons = [
//   {
//     name: 'Arto Hellas',
//     number: '040-123456',
//     id: 1,
//   },
//   {
//     name: 'Ada Lovelace',
//     number: '39-44-5323523',
//     id: 2,
//   },
//   {
//     name: 'Dan Abramov',
//     number: '12-43-234345',
//     id: 3,
//   },
//   {
//     name: 'Mary Poppendieck',
//     number: '39-23-6423122',
//     id: 4,
//   },
// ];

app.use(express.static('build'))

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  res.send(
    `<p>Phonebook has info for ${Person.length} people.</p><p>${Date()}</p>`
  )
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// prettier-ignore
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => { // eslint-disable-line no-unused-vars
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  if (!request.body.name) {
    response.status(400).json({ error: '`name` missing' })
  }
  if (!request.body.number) {
    response.status(400).json({ error: '`number` missing' })
  }
  const person = new Person({
    name: request.body.name,
    number: request.body.number
  })
  console.log('Saving person using person.save()')
  person
    .save()
    .then(savedPerson => {
      console.log(
        `New person ${savedPerson.name} (${savedPerson.number}) added to phonebook!`
      )
      response.json(savedPerson.toJSON())
    })
    .catch(error => {
      console.log('Cannot add person, because', error.message)
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = { name: body.name, number: body.number }
  Person.findByIdAndUpdate(request.params.id, person, {
    new: true
    // runValidators: true,
  })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)
