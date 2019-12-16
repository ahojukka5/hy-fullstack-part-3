const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0-ahybr.mongodb.net/test?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

// console.log('connection url = ', url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({})
    .then(result => {
      const numberOfPersons = result.length
      console.log(`Listing all ${numberOfPersons} contact in phone book.`)
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
    .catch(error => {
      console.log(`Unable to list persons: ${error.message}`)
    })
} else if (process.argv.length === 5) {
  console.log('Adding new person to phone book.')
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(response => {
    console.log('New entry to phone book saved!')
    console.log(response)
    mongoose.connection.close()
  })
} else {
  console.log('Wrong number of input arguments.')
}
