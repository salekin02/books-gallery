// app.js
let books = [];
let filteredBooks = [];
let currentPage = 1;
const itemsPerPage = 10;

const bookList = document.getElementById('book-list');
const searchBar = document.getElementById('search-bar');
const genreFilter = document.getElementById('genre-filter');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Function to show skeleton loader
const showSkeletonLoader = () => {
  bookList.innerHTML = '';
  for (let i = 0; i < itemsPerPage; i++) {
    const skeleton = document.createElement('div');
    skeleton.classList.add('book-item', 'skeleton');
    skeleton.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
    `;
    bookList.appendChild(skeleton);
  }
};

// Function to fetch books
const fetchBooks = async (page = 1) => {
  showSkeletonLoader();
  try {
    const response = await fetch(`https://gutendex.com/books/?page=${page}`);
    const data = await response.json();
    books = data.results;
    filteredBooks = books;
    displayBooks();
    displayPagination(data);
    populateGenres();
  } catch (error) {
    console.error('Error fetching books:', error);
  }
};

// Function to display books
const displayBooks = () => {
  bookList.innerHTML = '';
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  paginatedBooks.forEach((book) => {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');
    bookItem.innerHTML = `
      <img src="${book.formats['image/jpeg']}" alt="${book.title}" class="book-cover">
      <div class="book-details">
        <h3>${book.title}</h3>
        <p>Author: ${book.authors.map(author => author.name).join(', ')}</p>
        <p>Genre: ${book.subjects.join(', ')}</p>
      </div>
      <button class="wishlist-btn" data-id="${book.id}">♡</button>
    `;
    bookList.appendChild(bookItem);
  });
  updateWishlistIcons();
};

// Function to display pagination
const displayPagination = (data) => {
  pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(data.count / itemsPerPage)}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === Math.ceil(data.count / itemsPerPage);
};

// Populate genre dropdown
const populateGenres = () => {
  const allGenres = [...new Set(books.flatMap(book => book.subjects))];
  genreFilter.innerHTML = '<option value="">All Genres</option>'; // Reset options
  allGenres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
};

// Search by title
searchBar.addEventListener('input', (e) => {
  const searchValue = e.target.value.toLowerCase();
  filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchValue));
  displayBooks();
});

// Filter by genre
genreFilter.addEventListener('change', (e) => {
  const genreValue = e.target.value;
  if (genreValue === '') {
    filteredBooks = books;
  } else {
    filteredBooks = books.filter(book => book.subjects.includes(genreValue));
  }
  displayBooks();
});

// Wishlist functionality
const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

bookList.addEventListener('click', (e) => {
  if (e.target.classList.contains('wishlist-btn')) {
    const bookId = e.target.dataset.id;
    if (wishlist.includes(bookId)) {
      wishlist.splice(wishlist.indexOf(bookId), 1);
      e.target.textContent = '♡';
    } else {
      wishlist.push(bookId);
      e.target.textContent = '♥';
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }
});

const updateWishlistIcons = () => {
  const wishlistBtns = document.querySelectorAll('.wishlist-btn');
  wishlistBtns.forEach(btn => {
    if (wishlist.includes(btn.dataset.id)) {
      btn.textContent = '♥';
    } else {
      btn.textContent = '♡';
    }
  });
};

// Pagination buttons
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchBooks(currentPage);
  }
});

nextBtn.addEventListener('click', () => {
  currentPage++;
  fetchBooks(currentPage);
});

// Initial fetch
fetchBooks();