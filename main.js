
const bookList = document.getElementById('book-list');
const searchBar = document.getElementById('search-bar');
const genreFilter = document.getElementById('genre-filter');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const loadingIndicator = document.getElementById('loading');
const baseUrl = 'https://gutendex.com/books/';
let booksData = []; // Store fetched book data
let currentPage = 1;
const booksPerPage = 10;
let paginationData = {};

// Fetch initial book data
fetchBooks();

// Function to fetch books from the API
async function fetchBooks(url = baseUrl) {
    loadingIndicator.style.display = 'flex'; // Show loading animation
    bookList.innerHTML = ''; // Clear previous results
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const { results, ...rest } = data;
        booksData = results;
        paginationData = rest;
        renderBooks();
        updatePagination(rest);
        extractGenres(results); // Extract genres after fetching
    } catch (error) {
        console.error('Error fetching books:', error);
        bookList.innerHTML = '<p>Error loading books.</p>';
    } finally {
        loadingIndicator.style.display = 'none'; // Hide loading animation
    }
}

// Function to render books on the page
function renderBooks() {
    const booksToRender = booksData
    bookList.innerHTML = '';

    booksToRender.forEach(book => {
        const bookCard = createBookCard(book);
        bookList.appendChild(bookCard);
    });
}

// Function to create a book card element
function createBookCard(book) {
    const card = document.createElement('div');
    card.classList.add('book-card');

    const img = document.createElement('img');
    img.src = book.formats['image/jpeg'] || ''; // Get cover image
    img.alt = book.title;
    card.appendChild(img);

    const title = document.createElement('h2');
    title.textContent = book.title;
    card.appendChild(title);

    const author = document.createElement('p');
    author.textContent = `by ${book.authors[0] ? book.authors[0].name : 'Unknown Author'}`;
    card.appendChild(author);

    // Add genres (simplified - you might want to display multiple genres)
    const genre = document.createElement('p');
    genre.textContent = `Genre: ${book.subjects[0] || 'Unknown'}`;
    card.appendChild(genre);


    const bookId = document.createElement('span');
    genre.textContent = `Book Id: ${book.id}`;
    card.appendChild(bookId);

    const wishlistIcon = document.createElement('span');
    wishlistIcon.classList.add('wishlist-icon');
    wishlistIcon.title = 'Add to Wishlist';
    wishlistIcon.innerHTML = '&#x2661;'; // Heart symbol
    wishlistIcon.dataset.bookId = book.id; // Store book ID for wishlist

    // Check if book is in wishlist
    if (isBookInWishlist(book.id)) {
        wishlistIcon.classList.add('active');
    }

    wishlistIcon.addEventListener('click', toggleWishlist);
    card.appendChild(wishlistIcon);

    return card;
}

// Function to update pagination buttons
function updatePagination(data) {
    const { next, previous } = data;
    prevPageButton.disabled = !previous;
    nextPageButton.disabled = !next;
}

// Event listeners for pagination
prevPageButton.addEventListener('click', () => {
    const url = paginationData?.previous;
    if (url) {
        fetchBooks(url);
    }
});

nextPageButton.addEventListener('click', () => {
    const url = paginationData?.next;
    if (url) {
        fetchBooks(url);
    }
});

// Search functionality
searchBar.addEventListener('input', () => {
    const searchTerm = searchBar.value.toLowerCase();
    const filteredBooks = booksData.filter(book => {
        return book.title.toLowerCase().includes(searchTerm);
    });
    currentPage = 1; // Reset to first page when searching
    booksData = filteredBooks; // Update the booksData with the filtered results
    renderBooks();
    updatePagination({ count: filteredBooks.length }); // Update pagination
});

// Genre filter functionality
genreFilter.addEventListener('change', () => {
    const selectedGenre = genreFilter.value;
    if (selectedGenre) {
        const filteredBooks = booksData.filter(book => {
            return book.subjects.some(subject => subject.toLowerCase().includes(selectedGenre));
        });
        currentPage = 1; // Reset to first page when filtering
        booksData = filteredBooks; // Update the booksData with the filtered results
        renderBooks();
        updatePagination({ count: filteredBooks.length }); // Update pagination
    } else {
        fetchBooks(); // Fetch all books if "All Genres" is selected
    }
});

// Wishlist functionality
function isBookInWishlist(bookId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    return wishlist.includes(bookId);
}

function toggleWishlist(event) {
    const bookId = parseInt(event.target.dataset.bookId);
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (wishlist.includes(bookId)) {
        // Remove from wishlist
        const index = wishlist.indexOf(bookId);
        wishlist.splice(index, 1);
        event.target.classList.remove('active');
    } else {
        // Add to wishlist
        wishlist.push(bookId);
        event.target.classList.add('active');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Function to extract genres and populate the genre filter dropdown
function extractGenres(books) {
    const genres = new Set();
    books.forEach(book => {
        book.subjects.forEach(subject => {
            genres.add(subject);
        });
    });

    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}