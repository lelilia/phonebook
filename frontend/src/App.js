import React, { useState, useEffect } from 'react'
import Filter from './components/Filter'
import NewEntryForm from './components/NewEntryForm '
import Entries from './components/Entries'
import Header from './components/Header'
import entryServices from './services/entries'

const Notification = ({ notification }) => {
  if (notification === null) {
    return null
  }
  const className = `message ${notification.color}`
  return (
    <div className={className} >
      {notification.message}
    </div>
  )
}

const App = () => {
  const [entries, setEntries] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)

  useEffect(() => {
    entryServices
      .getAll()
      .then(initialEntries => {
        setEntries(initialEntries)
      })
  }, [])

  const displayMessage = (message, color = "notification") => {
    setNotificationMessage({ message, color })
    setTimeout(() => setNotificationMessage(null), 5000)
  }

  const addEntry = (event) => {
    event.preventDefault()
    const filteredEntries = entries.filter(entry => entry.name === newName)
    if (filteredEntries.length !== 0) {

      const entry = filteredEntries[0]
      const id = entry.id
      const confirmMessage = `${entry.name} is already added to the phonebook, replace the old number with a new one?`

      if (window.confirm(confirmMessage)) {
        const changedEntry = { ...entry, number: newNumber }

        entryServices
          .update(id, changedEntry)
          .then(returnedEntry => {
            setEntries(entries.map(entry => entry.id !== id ? entry : returnedEntry))
            displayMessage(`Updated number for ${returnedEntry.name} sucessfully.`)
            setNewNumber('')
            setNewName('')
          })
          .catch(error => {
            if (error.response.data.error === "number not valid") {
              displayMessage(error.response.data.error, "error")
            }
            else {
              displayMessage(`Information of ${entry.name} has already been removed from server`, "error")
              setEntries(entries.filter(e => e.id !== entry.id))
            }
          })
      }
    }
    else {
      const newEntryObject = {
        name: newName,
        number: newNumber
      }

      entryServices
        .create(newEntryObject)
        .then(returnedEntry => {
          setEntries(entries.concat(returnedEntry))
          displayMessage(`Added ${returnedEntry.name} sucessfully.`)
          setNewNumber('')
          setNewName('')
        })
        .catch(error => {
          displayMessage(error.response.data.error, "error")
        })
    }

  }

  const deleteEntry = entry => {
    if (window.confirm(`Delete ${entry.name}?`)) {
      const id = entry.id
      entryServices
        .deleteEntry(entry.id)
        .then(() => {
          setEntries(entries.filter(entry => entry.id !== id))
          displayMessage(`Deleted number for ${entry.name} sucessfully.`)
        })
        .catch(() => {
          displayMessage(`Information of ${entry.name} has already been removed from server`, "error")
          setEntries(entries.filter(e => e.id !== entry.id))
        })
    }
  }

  const handleNameChange = (event) => setNewName(event.target.value)

  const handleNumberChange = (event) => setNewNumber(event.target.value)

  const handleFilterChange = (event) => setFilter(event.target.value.toLowerCase())

  const entriesToShow = filter.length === 0
    ? entries
    : entries.filter(entry => entry.name.toLowerCase().includes(filter))

  return (
    <div>
      <Header text="Phonebook" />
      <Notification notification={notificationMessage} />

      <Filter filter={filter} onChange={handleFilterChange} />
      <Header text="add a new" />
      <NewEntryForm
        addPerson={addEntry}
        nameChange={handleNameChange}
        numberChange={handleNumberChange}
        newName={newName}
        newNumber={newNumber}
      />
      <Header text="Numbers" />
      <Entries
        entries={entriesToShow}
        deleteButton={deleteEntry}
      />

    </div>
  )
}

export default App