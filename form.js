// Create needed constants
const list = document.querySelector('ul');
// const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#reviewText');
const form = document.querySelector('form');
const submitBtn = document.querySelector('form button');
const isAdmin = window.location.hash.substr(1) === 'admin';

// Create an instance of a db object for us to store the open database in
let db;

window.onload = function() {
// Open our database; it is created if it doesn't already exist
// (see onupgradeneeded below)
let request = window.indexedDB.open('notes', 1);

// onerror handler signifies that the database didn't open successfully
request.onerror = function() {
  console.log('Database failed to open');
};

// onsuccess handler signifies that the database opened successfully
request.onsuccess = function() {
  console.log('Database opened successfully');

  // Store the opened database object in the db variable. This is used a lot below
  db = request.result;

  // Run the displayData() function to display the notes already in the IDB
  displayData();
};

// Setup the database tables if this has not already been done
request.onupgradeneeded = function(e) {
  // Grab a reference to the opened database
  let db = e.target.result;

  // Create an objectStore to store our notes in (basically like a single table)
  // including a auto-incrementing key
  let objectStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement:true });

  // Define what data items the objectStore will contain
  objectStore.createIndex('review', 'review', { unique: false });
  objectStore.createIndex('date', 'date', { unique: false });

  console.log('Database setup complete');
};

// Create an onsubmit handler so that when the form is submitted the addData() function is run
form.onsubmit = addData;

// Define the addData() function
function addData(e) {
  // prevent default - we don't want the form to submit in the conventional way
  e.preventDefault();

  // grab the values entered into the form fields and store them in an object ready for being inserted into the DB
  let newItem = { review: bodyInput.value, date: (new Date()).toLocaleString() };

  // open a read/write db transaction, ready for adding the data
  let transaction = db.transaction(['notes'], 'readwrite');

  // call an object store that's already been added to the database
  let objectStore = transaction.objectStore('notes');

  // Make a request to add our newItem object to the object store
  var request = objectStore.add(newItem);
  request.onsuccess = function() {
    // Clear the form, ready for adding the next entry
    bodyInput.value = '';
    // bodyInput.value = '';
  };

  // Report on the success of the transaction completing, when everything is done
  transaction.oncomplete = function() {
    console.log('Transaction completed: database modification finished.');

    // update the display of data to show the newly added item, by running displayData() again.
    displayData();
  };

  transaction.onerror = function() {
    console.log('Transaction not opened due to error');
  };
}

// Define the displayData() function
function displayData() {
  // Here we empty the contents of the list element each time the display is updated
  // If you ddn't do this, you'd get duplicates listed each time a new note is added
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  // Open our object store and then get a cursor - which iterates through all the
  // different data items in the store
  let objectStore = db.transaction('notes').objectStore('notes');
  objectStore.openCursor(null, 'prev').onsuccess = function(e) {
    // Get a reference to the cursor
    let cursor = e.target.result;

    // If there is still another data item to iterate through, keep running this code
    if(cursor) {
      // Create a list item, ita, and p to put each data item inside when displaying it
      // structure the HTML fragment, and append it inside the list
      let listItem = document.createElement('li');
      let ita = document.createElement('i');
      ita.style = 'color: #80808087';
      let para = document.createElement('p');

      listItem.appendChild(ita);

      if (isAdmin) {
        // Create a button and place it inside each listItem
        let deleteBtn = document.createElement('button');
        listItem.appendChild(deleteBtn);
        deleteBtn.textContent = 'X';

        // Set an event handler so that when the button is clicked, the deleteItem()
        // function is run
        deleteBtn.onclick = function(e) {
          deleteItem(e);
        };
      }

      listItem.appendChild(para);
      list.appendChild(listItem);

      // Put the data from the cursor inside the ita and para
      ita.textContent = cursor.value.id + '. ' + cursor.value.date + ' ';
      para.textContent = cursor.value.review;

      // Store the ID of the data item inside an attribute on the listItem, so we know
      // which item it corresponds to. This will be useful later when we want to delete items
      listItem.setAttribute('data-note-id', cursor.value.id);

      // Iterate to the next item in the cursor
      cursor.continue();
    } else {
      // Again, if list item is empty, display a 'No notes stored' message
      if(!list.firstChild) {
        let listItem = document.createElement('li');
        listItem.textContent = 'No notes stored.'
        list.appendChild(listItem);
      }
      // if there are no more cursor items to iterate through, say so
      console.log('Notes all displayed');
    }
  };
}

// Define the deleteItem() function
function deleteItem(e) {
  // retrieve the name of the task we want to delete. We need
  // to convert it to a number before trying it use it with IDB; IDB key
  // values are type-sensitive.
  let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));

  // open a database transaction and delete the task, finding it using the id we retrieved above
  let transaction = db.transaction(['notes'], 'readwrite');
  let objectStore = transaction.objectStore('notes');
  let request = objectStore.delete(noteId);

  // report that the data item has been deleted
  transaction.oncomplete = function() {
    // delete the parent of the button
    // which is the list item, so it is no longer displayed
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    console.log('Note ' + noteId + ' deleted.');

    // Again, if list item is empty, display a 'No notes stored' message
    if(!list.firstChild) {
      let listItem = document.createElement('li');
      listItem.textContent = 'No notes stored.';
      list.appendChild(listItem);
    }
  };
}

};
