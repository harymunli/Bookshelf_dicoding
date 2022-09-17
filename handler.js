const {nanoid} = require('nanoid');
const books = require('./books');
const addBookHandler = (request, h) => {
  const {name, year, author, summary} = request.payload;
  const {publisher, pageCount, readPage, reading} = request.payload;

  if (name === undefined) {
    const response = h.response({
      'status': 'fail',
      'message': 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  } else if (readPage > pageCount) {
    let msg = 'Gagal menambahkan buku. readPage';
    msg = msg+' tidak boleh lebih besar dari pageCount';
    return h.response({
      'status': 'fail',
      'message': msg,
    }).code(400);
  }

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id, name, year, author, summary, publisher, pageCount,
    readPage, finished, reading, insertedAt, updatedAt,
  };
  books.push(newBook);

  const isSuccess = books.filter((b) => b.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        'bookId': id,
      },
    });
    response.code(201);
    return response;
  } else {
    const response = h.response({
      status: 'fail',
      message: 'Catatan gagal ditambahkan',
    });
    response.code(500);
    return response;
  }
};

const getAllBookHandler = (request, h) => {
  let qBooks = books;
  if (request.query !== undefined) {
    const qname = request.query.name;
    const qreading = request.query.reading;
    const qfinished = request.query.finished;
    if (qname!== undefined) {
      qBooks = qBooks.filter((val) => {
        return val.name.toLowerCase().includes(qname.toLowerCase());
      });
    }
    if (qreading !== undefined) {
      if (qreading === '0') {
        qBooks = qBooks.filter((val) => {
          return val.reading === false;
        });
      } else if (qreading === '1') qBooks = qBooks.filter((val) => val.reading);
    }
    if (qfinished !== undefined) {
      if (qfinished === '0') {
        qBooks = qBooks.filter((val) => {
          return val.finished === false;
        });
      } else if (qfinished === '1') {
        qBooks = qBooks.filter((val) =>{
          return val.finished;
        });
      }
    }
  }
  const buku = [];
  qBooks.forEach((b)=>{
    buku.push({
      'id': b.id,
      'name': b.name,
      'publisher': b.publisher,
    });
  });
  return h.response({
    status: 'success',
    data: {
      books: buku,
    },
  }).code(200);
};

const getBookById = (request, h) => {
  const found = books.find((b) => b.id == request.params.id);
  if (found === undefined) {
    return h.response({
      'status': 'fail',
      'message': 'Buku tidak ditemukan',
    }).code(404);
  } else {
    const obj = {'book': found};
    const response = h.response({
      'status': 'success',
      'data': obj,
    }).code(200);
    return response;
  }
};

const editBookById = (request, h) => {
  const {name, pageCount, readPage} = request.payload;

  if (name === undefined) {
    return h.response({
      'status': 'fail',
      'message': 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  } else if ( readPage > pageCount) {
    let msg = 'Gagal memperbarui buku. readPage tidak';
    msg = msg+' boleh lebih besar dari pageCount';
    return h.response({
      'status': 'fail',
      'message': msg,
    }).code(400);
  }

  const index = books.findIndex((b) => b.id == request.params.id);
  const updatedAt = new Date().toISOString();
  if (index !== -1) {
    books[index] = {
      ...books[index],
      ...request.payload,
      updatedAt,
    };

    return h.response({
      'status': 'success',
      'message': 'Buku berhasil diperbarui',
    }).code(200);
  } else {
    return h.response({
      'status': 'fail',
      'message': 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
  }
};

const deleteBookById = (request, h) => {
  const index = books.findIndex((b) => b.id == request.params.id);

  if (index !== -1) {
    books.splice(index, 1);

    return h.response({
      'status': 'success',
      'message': 'Buku berhasil dihapus',
    }).code(200);
  } else {
    return h.response({
      'status': 'fail',
      'message': 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
  }
};

module.exports = {
  addBookHandler, getAllBookHandler, getBookById,
  editBookById, deleteBookById,
};
