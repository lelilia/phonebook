import React from 'react'
import Entry from './Entry'

const Entries = ({ entries, deleteButton }) => {
  return (
    <ul>
      {entries.map((entry) => 
        <Entry 
          key = {entry.id} 
          entry = {entry} 
          deleteButton = {deleteButton}
        />
      )}
    </ul>
  )
}

export default Entries