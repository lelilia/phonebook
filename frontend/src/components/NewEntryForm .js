import React from 'react'

const NewEntryForm = (props) => {
  return (
    <form onSubmit = { props.addPerson }>
      <div>
        name: <input value = { props.newName } onChange = { props.nameChange } />
        <br/>
        number: <input value = { props.newNumber } onChange = { props.numberChange }/>
      </div>
      <div>
        <button type = "submit">
          add 
        </button>
      </div>
    </form>
  )
}

export default NewEntryForm