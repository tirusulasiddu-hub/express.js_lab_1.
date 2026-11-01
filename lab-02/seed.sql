CREATE TABLE book (
  id INTEGER PRIMARY KEY,
  title TEXT,
  author TEXT,
  price INTEGER,
  pages INTEGER
);

INSERT INTO book (title, author, price, pages) VALUES
  ('To Kill a Mockingbird', 'Harper Lee', 399, 281),
  ('1984', 'George Orwell', 299, 328),
  ('Pride and Prejudice', 'Jane Austen', 249, 279),
  ('The Great Gatsby', 'F. Scott Fitzgerald', 199, 180),
  ('One Hundred Years of Solitude', 'Gabriel Garcia Marquez', 499, 417),
  ('Crime and Punishment', 'Fyodor Dostoevsky', 450, 430),
  ('The Catcher in the Rye', 'J. D. Salinger', 350, 234),
  ('The Hobbit', 'J. R. R. Tolkien', 399, 310),
  ('Brave New World', 'Aldous Huxley', 320, 268),
  ('Midnight''s Children', 'Salman Rushdie', 550, 446);
