const bookDetailsContainer = document.getElementById('book-details');
const loadingIndicator = document.getElementById('loader');

function displayBookDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (!bookId) {
        bookDetailsContainer.innerHTML = '<p>Invalid book ID.</p>';
        return;
    }

    loadingIndicator.style.display = 'block';
    fetch(`https://gutendex.com/books/${bookId}`)
        .then(response => response.json())
        .then(book => {
            loadingIndicator.style.display = 'none';
            const detailsHTML = `
                <img src="${book.formats['image/jpeg']}" alt="${book.title}">
                <div class="details">
                    <h2>${book.title}</h2>
                    <p>by ${book.authors[0] ? book.authors[0].name : 'Unknown Author'}</p>
                    <p>Genre: ${book.subjects.join(', ')}</p> 
                    <p>Book Id: ${book.id}</p>
                    </div>
            `;
            bookDetailsContainer.innerHTML = detailsHTML;
        })
        .catch(error => {
            console.error('Error fetching book details:', error);
            bookDetailsContainer.innerHTML = '<p>Error loading book details.</p>';
        });
}

displayBookDetails();