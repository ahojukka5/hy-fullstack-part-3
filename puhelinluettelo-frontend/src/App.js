import React, {useState, useEffect} from 'react';
import './App.css';
import personService from './services/persons';

const Person = props => {
  const {person, onDelete} = props;
  return (
    <li>
      {person.name} ({person.number}) <button onClick={onDelete}>X</button>
    </li>
  );
};

const Filter = props => {
  const {onChange, value} = props;
  return (
    <p>
      Filter by name: <input onChange={onChange} value={value} />
    </p>
  );
};

const PersonForm = props => {
  const {onSubmit, onNameChange, name, onNumberChange, number} = props;
  return (
    <form onSubmit={onSubmit}>
      <div>
        name: <input onChange={onNameChange} value={name} />
      </div>
      <div>
        number: <input onChange={onNumberChange} value={number} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Persons = props => {
  const {persons, setPersons, nameFilter, notify} = props;

  let filteredPersons = persons;
  if (nameFilter !== '') {
    filteredPersons = persons.filter(person =>
      person.name.toLowerCase().includes(nameFilter.toLowerCase()),
    );
  }

  const rows = () => {
    return filteredPersons.map(person => {
      const onDelete = () => {
        if (window.confirm(`Delete person ${person.id}: ${person.name}?`)) {
          personService.delete_(person).then(response => {
            setPersons(persons.filter(p => p.id !== person.id));
          });
          notify(`Person ${person.name} deleted from phonebook!`, 5000);
        }
      };
      return <Person key={person.id} person={person} onDelete={onDelete} />;
    });
  };

  return <ul>{rows()}</ul>;
};

const Notification = ({message}) => {
  if (message === null) {
    return null;
  }
  return <div className="notification">{message}</div>;
};

const App = props => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [notificationMessage, setNotificationMessage] = useState(null);

  useEffect(() => {
    personService.getAll().then(response => {
      setPersons(response.data);
    });
  }, []);

  const handleNameChange = event => {
    setNewName(event.target.value);
  };

  const handleNumberChange = event => {
    setNewNumber(event.target.value);
  };

  const handleNameFilterChange = event => {
    setNameFilter(event.target.value);
  };

  const notify = (message, time) => {
    setNotificationMessage(message);
    setTimeout(() => {
      setNotificationMessage(null);
    }, time);
  };

  const addPerson = event => {
    event.preventDefault();

    const newPerson = {
      name: newName,
      number: newNumber,
    };

    console.log('Starting adding new person, checking does already exists...');

    const maybeExistingPerson = persons.find(person => person.name === newName);
    if (maybeExistingPerson) {
      console.log('Already existing person');
      const existingPerson = {...maybeExistingPerson, number: newNumber};
      if (
        window.confirm(
          `${existingPerson.name} is already added to phonebook, replace the old number with a new one?`,
        )
      ) {
        console.log('Updating old contact');
        personService
          .update(existingPerson)
          .then(response => {
            const newPersons = persons.map(person => {
              return person.id === existingPerson.id ? existingPerson : person;
            });
            setPersons(newPersons);
            setNewNumber('');
            setNewName('');
            notify(`Phone number updated for ${existingPerson.name}`, 5000);
          })
          .catch(error => {
            console.log(`Error updating person: ${error}`);
            notify(
              `${existingPerson.name} does not exist on phone book (anymore)!`,
              5000,
            );
            setPersons(
              persons.filter(person => person.id !== existingPerson.id),
            );
          });
      }
    } else {
      console.log(
        `Creating new person ${newPerson.name} with a number ${newPerson.number}`,
      );
      personService
        .create(newPerson)
        .then(response => {
          setPersons(persons.concat(response.data));
          setNewNumber('');
          setNewName('');
          notify(
            `Created new person ${newPerson.name} with number ${newPerson.number}`,
            5000,
          );
        })
        .catch(error => {
          console.log(
            'Unable to create new contact:',
            error.response.data.error,
          );
          notify(error.response.data.error, 5000);
        });
    }
  };

  return (
    <div>
      <Notification message={notificationMessage} />
      <h1>Phonebook</h1>
      <h2>Add a new contact</h2>
      <PersonForm
        onSubmit={addPerson}
        name={newName}
        number={newNumber}
        onNameChange={handleNameChange}
        onNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Filter onChange={handleNameFilterChange} value={nameFilter} />
      <Persons
        persons={persons}
        setPersons={setPersons}
        nameFilter={nameFilter}
        notify={notify}
      />
    </div>
  );
};

export default App;
