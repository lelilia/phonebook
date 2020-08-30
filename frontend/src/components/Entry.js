import React from 'react'

const Entry = ({ entry, deleteButton }) => {
  return (
    <li>
      {entry.name} {entry.number}
      <button onClick = {() => deleteButton(entry)}>delete</button>
    </li>
  )
}

export default Entry