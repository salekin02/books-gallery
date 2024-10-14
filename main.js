const API_URL = 'https://gutendex.com/books/';
const ITEMS_PER_PAGE = 10;
let books = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let currentPage = 1;
let currentGenre = '';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
    loadGenres();
    setupEventListeners();
});

async function fetchBooks() {
  showSkeletons();
  const response = await fetch(API_URL);
  const data = await response.json();
  books = data.results;
  renderBooks();
  renderPagination();
}

function showSkeletons() {
  const skeletonCards = Array.from({ length: ITEMS_PER_PAGE }).map(() => `
      <div class="skeleton-card">
          <div class="skeleton-cover"></div>
          <div class="skeleton-text title"></div>
          <div class="skeleton-text author"></div>
      </div>
  `).join('');
  document.getElementById('book-list').innerHTML = skeletonCards;
}


function loadGenres() {
    const genres = [...new Set(books.flatMap(book => book.subjects))];
    const genreFilter = document.getElementById('genre-filter');
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

function setupEventListeners() {
    document.getElementById('search-bar').addEventListener('input', event => {
        currentSearch = event.target.value.toLowerCase();
        currentPage = 1;
        renderBooks();
    });

    document.getElementById('genre-filter').addEventListener('change', event => {
        currentGenre = event.target.value;
        currentPage = 1;
        renderBooks();
    });

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) currentPage--;
        renderBooks();
    });

    document.getElementById('next-page').addEventListener('click', () => {
        currentPage++;
        renderBooks();
    });
}

function renderBooks() {
    const filteredBooks = books
        .filter(book => book.title.toLowerCase().includes(currentSearch))
        .filter(book => !currentGenre || book.subjects.includes(currentGenre));

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBooks = filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    document.getElementById('book-list').innerHTML = paginatedBooks.map(book => `
        <div class="book-card">
            <div class="cover" style="background-image: url(${book.formats['image/jpeg']})"></div>
            <div class="info">
                <p class="title">${book.title}</p>
                <p class="author">${book.authors.map(author => author.name).join(', ')}</p>
            </div>
            <button class="wishlist-btn" onclick="toggleWishlist(${book.id})">
                ${wishlist.includes(book.id) ? '❤️' : '🤍'}
            </button>
        </div>
    `).join('');

    renderPagination();
}

function renderPagination() {
    const pageNumbers = document.getElementById('page-numbers');
    const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);
    pageNumbers.innerHTML = Array.from({ length: totalPages }, (_, i) => `
        <button ${i + 1 === currentPage ? 'class="active"' : ''} onclick="changePage(${i + 1})">${i + 1}</button>
    `).join('');

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

function changePage(page) {
    currentPage = page;
    renderBooks();
}

function toggleWishlist(bookId) {
    if (wishlist.includes(bookId)) {
        wishlist = wishlist.filter(id => id !== bookId);
    } else {
        wishlist.push(bookId);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderBooks();
}
