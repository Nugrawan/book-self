const books = [];
const RENDER_EVENT = 'render-book'

// menjalankan fungsi jika dom berhasil diload
document.addEventListener('DOMContentLoaded', function () {
  // jika tombol submit pada form ditekan
    const submitForm = document.getElementById('formBuku');
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault(); //mencegah form di submit dan tifdak akan dikirim ke server
      addBook();
    });
    if (isStorageExist()) {  //mengecek apakah ada data di storage
      loadDataFromStorage();
    }
  });

  function addBook() {
    const titleBook = document.getElementById('judulBuku').value;
    const author = document.getElementById('penulisBuku').value;
    const dateBook = document.getElementById('tahunBuku').value;
    const generatedID = generateId();//membuat id unik pada buku
    const bookObject = generateBookObject(generatedID, titleBook, author, dateBook, false);
    books.push(bookObject);//menambahkan objek diatas kedalam array books

      const checkBox = document.getElementById('cbDone');
      if (checkBox.checked) {
        addTaskToCompleted(bookObject.id);
      }
   
    document.dispatchEvent(new Event(RENDER_EVENT));//mengeluarkan dari array dan dirender ulang dengan dispatchEvent
    saveData(); //menyimpan data ke storage browser
  }

//   menghasilkan identitas unik pada setiap book 
  function generateId() {
    return +new Date();//id yang dihasilkan tidak akan pernah sama karna itu angka yang merupakan jumlah milidetik yang telah berlalu sejak tanggal 1 Januari 1970
  }

// menghasilkan objek buku baru dgn parameter dan mengembalikan identitas buku  
  function generateBookObject(id, title, author, date, isCompleted) {
    return {
      id,
      title,
      author,
      date,
      isCompleted
    }
  }

//jika render event terjadi maka fungsi berjalan
  document.addEventListener(RENDER_EVENT, function () {
    console.log(books);
  });

  function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const authorBook = document.createElement('p');
    authorBook.innerText = 'Penulis : ' + bookObject.author;
   
    const dateBook = document.createElement('p');
    dateBook.innerText = 'Tahun terbit : ' + bookObject.date;
   
    const container = document.createElement('article');
    container.classList.add('buku');
    container.append(textTitle, authorBook, dateBook);
    container.setAttribute('id', `book-` + bookObject.id);//bisa juga menggunakan book-${bookObject.id}

    // jika tombol hijau di klik akan mengulangi buku ke belum selesai 
    if (bookObject.isCompleted) {
      const greenButton = document.createElement('button');
      greenButton.innerText = 'Ulangi';
      greenButton.classList.add('green');
      greenButton.addEventListener('click', function () {
        undoTaskFromCompleted(bookObject.id);
      });
      
      // jika tombol merah diklik maka akan menghapus buku
      const redButton = document.createElement('button');
      redButton.innerText = 'Hapus';
      redButton.classList.add('red');
      redButton.addEventListener('click', function () {
        removeTaskFromCompleted(bookObject.id);
      });

      const aksi = document.createElement('div');
      aksi.classList.add('action');
      aksi.append(greenButton, redButton);
   
      container.append(aksi);
    } else {
      // menambah buku ke rak selesai dibaca 
      const doneButton = document.createElement('button');
      doneButton.innerText = 'Selesai';
      doneButton.classList.add('green');
      doneButton.addEventListener('click', function () {
        addTaskToCompleted(bookObject.id);
      });

      // menghapus buku 
      const deleteButton = document.createElement('button');
      deleteButton.innerText = 'Hapus';
      deleteButton.classList.add('red');
      deleteButton.addEventListener('click', function()  {
        removeTaskFromCompleted(bookObject.id);
      });

      const aksi = document.createElement('div');
      aksi.classList.add('action');
      aksi.append(doneButton, deleteButton);
      container.append(aksi);
    }
    return container;
  }

  // menjalankan fungsi jika RENDER EVENT TERJADI
  document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBook = document.getElementById('incompleteBook');
    uncompletedBook.innerHTML = '';
   
    const completedBook = document.getElementById('completeBook');
    completedBook.innerHTML = '';
    
    for (const bookItem of books) {
      // menjadikan item buku sebagai argument dan mengembalikan elemen2 html buku dengan makeBook
      const bookElement = makeBook(bookItem);

      // jika bookItem bernilai false maka akan dimasukkan kedalam incompleteBook
      if (!bookItem.isCompleted)
        uncompletedBook.append(bookElement);

      //jika bookItem bernilai true maka akan di masukkan kedalam completeBook
      else
        completedBook.append(bookElement);
    }
  });

  //fungsi mencari buku dan jika buku ada maka akan diubah menjadi true
  function addTaskToCompleted (bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) { //memeriksa apakah sama
        return bookItem;
      }
    }
    return null;
  }

  function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);// untuk menghapus buku dari array 
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
    return -1;
  }

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  const SAVED_EVENT = 'saved-book';
  const STORAGE_KEY = 'BOOKSHELF_APPS';

  function isStorageExist(){
    if (typeof(Storage) === undefined) {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }
    return true;
  }

  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
    //alert('Berhasil Ditambahkan!!!');
  });

  //Menampilkan data dari local storage
  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  }