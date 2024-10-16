
const wishlistList = document.getElementById('book-list');
const noBooksMessage = document.getElementById('no-books');
const loadingIndicator = document.getElementById('loader');

function displayWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (wishlist.length === 0) {
        noBooksMessage.style.display = 'block';
        return;
    }

    wishlistList.innerHTML = ''; // Clear previous list

    loadingIndicator.style.display = 'block'; // Show loading animation
    wishlist.forEach(bookId => {
        fetch(`https://gutendex.com/books/${bookId}`)
            .then(response => response.json())
            .then(book => {
                loadingIndicator.style.display = 'none'; // Hide loading animation
                const bookCard = createBookCard(book);
                wishlistList.appendChild(bookCard);
            })
            .catch(error => {
                console.error('Error fetching book details:', error);
            });
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.classList.add('book-card');

    const img = document.createElement('img');
    img.src = book.formats['image/jpeg'] || ''; // Get cover image
    img.alt = book.title;
    card.appendChild(img);

    const div = document.createElement('div');
    const title = document.createElement('a'); // Make title a link
    title.href = `${location.origin}/book/index.html?id=${book.id}`; 
    title.textContent = book.title;
    div.appendChild(title);
    card.appendChild(div);


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
    
    return card;
}


displayWishlist();