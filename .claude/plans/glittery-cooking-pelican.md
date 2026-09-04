# Plan: Add React Router for Basic Routing

## Context

The Book Management System is a MERN stack application with a React frontend that currently renders all components (Header, BookList, Stats, BookModal) on a single page without client-side routing. The user has requested to implement basic routing using `react-router-dom` to enable navigation between different views (e.g., home view, add book view, edit book view) using URL paths.

## Goal

Implement client-side routing in the React frontend to allow users to navigate between:

- Home page (`/`): Displays the book list and statistics.
- Add Book page (`/add`): Displays a form to add a new book.
- Edit Book page (`/edit/:id`): Displays a form to edit an existing book.

This will improve user experience by enabling bookmarkable URLs and back/forward navigation.

## Implementation Plan

### 1. Install Dependency

Install `react-router-dom` via npm in the client directory:

```bash
cd Client/Book-management
npm install react-router-dom
```

### 2. Update App.jsx

Replace the current single-view structure with a router that defines routes for the different views.

Changes:

- Import necessary components from `react-router-dom` (`BrowserRouter`, `Routes`, `Route`, `Link`, `useNavigate`).
- Create a `Home` component that contains the current main content (Header, BookList, Stats) but without the modal.
- Create an `AddBookPage` component that displays a form for adding a book (reusing logic from `BookModal` but as a page).
- Create an `EditBookPage` component that displays a form for editing a book (similar to `AddBookPage` but pre-populated with book data).
- Modify the `Header` to include navigation links (Home, Add Book) and make it persistent across routes.
- Update the `BookList` and `BookCard` components to use `useNavigate` for navigation to the edit page instead of opening the modal.
- Remove the modal from `App.jsx` since add/edit operations will now happen on dedicated pages.

### 3. Component Changes

#### App.jsx

- Wrap the app in `BrowserRouter`.
- Define routes:
  - `<Route path="/" element={<Home />} />`
  - `<Route path="/add" element={<AddBookPage />} />`
  - `<Route path="/edit/:id" element={<EditBookPage />} />`
- Remove the modal state and related handlers (`isModalOpen`, `editingBook`, `handleOpenAddModal`, `handleOpenEditModal`, `handleSaveBook`).
- Keep the `books` state and related functions (`handleDeleteBook`, `handleToggleFavorite`, etc.) but move them to the `Home` component or pass them down as needed.

#### Home.jsx (new component)

- Contains:
  - Header (with links to Home and Add Book)
  - BookList (modified to use navigation for edit)
  - Stats
  - A floating action button or header button to navigate to `/add` for adding a new book.

#### AddBookPage.jsx (new component)

- Contains:
  - Header (with a back link to Home)
  - A form identical to the current `BookModal` content (form fields, validation, submit handler).
  - On submit, add the new book and navigate back to home.
  - Cancel button to navigate back to home.

#### EditBookPage.jsx (new component)

- Similar to `AddBookPage` but:
  - Fetches the book data by `id` from the URL parameter using `useParams` and `useEffect`.
  - Pre-populates the form with the book's data.
  - On submit, updates the book and navigates back to home.

#### Header.jsx (updated)

- Add navigation links:
  - Link to "/" (Home)
  - Link to "/add" (Add Book)
- Keep the theme toggle and other existing functionality.

#### BookList.jsx and BookCard.jsx (updated)

- In `BookCard`, replace the edit button's `onEdit` handler (which opened the modal) with a navigation call to `/edit/${book.id}` using `useNavigate`.
- Remove the `onEdit` prop from `BookList` and `BookCard` if no longer needed for modal.

### 4. State Management

- The `books` state and related functions (add, delete, toggle favorite) will be maintained in the `Home` component (or lifted to a context if we want to share across pages, but for simplicity we can keep in `Home` and pass via props or use a custom hook).
- For the edit page, we will need to fetch the book by ID from the `books` state. We can pass the `books` array and the update function as props to `EditBookPage`, or use a custom hook to access the state.

Given the simplicity of the app, we can lift the state to `App.jsx` and pass it down to the page components via props or context. However, to avoid prop drilling, we can use a custom hook or context. But for now, let's keep it simple and pass the necessary props.

Alternatively, we can keep the `books` state in `App.jsx` and pass it down to `Home`, `AddBookPage`, and `EditBookPage` as props, along with the handler functions.

Let's adjust:

- In `App.jsx`, keep the `books` state and the handler functions (`handleSaveBook` for add/update, `handleDeleteBook`, `handleToggleFavorite`).
- Pass these as props to the `Home`, `AddBookPage`, and `EditBookPage` components.

But note: the `Home` component also needs the `books` state and the handlers for delete and toggle favorite (which are already passed to `BookList`).

We can structure it as:

App.jsx:
state: books
handlers: handleAddBook, handleUpdateBook, handleDeleteBook, handleToggleFavorite

Then:
<Home books={books} onDeleteBook={handleDeleteBook} onToggleFavorite={handleToggleFavorite} onAddBook={handleAddBook} />
<AddBookPage onAddBook={handleAddBook} />
<EditBookPage books={books} onUpdateBook={handleUpdateBook} onDeleteBook={handleDeleteBook} />

But wait, the `handleSaveBook` in the original App handled both add and update. We can split it into two functions: `handleAddBook` and `handleUpdateBook`.

Alternatively, we can keep one `handleSaveBook` that checks if the book has an id (or _id) to determine if it's an update or add.

Let's keep the existing `handleSaveBook` and pass it to both add and edit pages. In the add page, we pass a bookToEdit of `null` or undefined, and in the edit page we pass the book to edit.

So:

  <AddBookPage onSave={handleSaveBook} bookToEdit={null} />
  <EditBookPage 
      bookToEdit={selectedBook}  // we will get this from the route param
      onSave={handleSaveBook} 
  />

But then we need to fetch the book by id in `EditBookPage`. We can do that by having the `books` array passed as a prop.

So:

<EditBookPage 
      books={books}
      onSave={handleSaveBook}
  />

And inside `EditBookPage`, we use `useParams` to get the `id`, then find the book in the `books` array.

### 5. Detailed Changes

#### File: Client/Book-management/src/App.jsx

- Import:
  ```javascript
  import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
  ```
- Remove:
  - `isModalOpen`, `editingBook`, `setIsModalOpen`, `setEditingBook`
  - `handleOpenAddModal`, `handleOpenEditModal`
  - `handleSaveBook` (we'll keep it but move it to be used by the pages)
  - `<BookModal />`
- Add:
  - `handleAddBook` and `handleUpdateBook` (or keep `handleSaveBook` and use it conditionally)
  - Actually, let's keep `handleSaveBook` as is (it handles both add and update) and pass it to the pages.

- State: `books` (same as before)

- Render:
  ```javascript
  <BrowserRouter>
    <div className="min-h-screen pb-16 transition-colors duration-200">
      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <Home
              books={books}
              onDeleteBook={handleDeleteBook}
              onToggleFavorite={handleToggleFavorite}
              onSave={handleSaveBook}
            />
          }
        />
        <Route path="/add" element={<AddBookPage onSave={handleSaveBook} />} />
        <Route
          path="/edit/:id"
          element={<EditBookPage books={books} onSave={handleSaveBook} />}
        />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  </BrowserRouter>
  ```

#### File: Client/Book-management/src/components/Home.jsx (new)

- Create this file.
- Props: `books`, `onDeleteBook`, `onToggleFavorite`, `onSave`
- State: same as before for search, genre, sort, view mode, toasts, etc.
- Move the state and handlers from `App.jsx` that are related to the home view (search, genre, sort, view mode, toasts) into this component.
- Render:
  - Header (with links to home and add book) - we'll update Header to accept props for links or we can use `NavLink` inside Header.
  - BookList (pass books, searchQuery, setSearchQuery, selectedGenre, setSelectedGenre, sortBy, setSortBy, viewMode, setViewMode, onEdit (now navigate to edit), onDelete, onToggleFavorite, onResetFilters, totalBooksCount)
  - Stats
  - A floating button or a button in the header to go to "/add" for adding a new book.

#### File: Client/Book-management/src/components/AddBookPage.jsx (new)

- Create this file.
- Props: `onSave` (function to save the book)
- State: form data (bookName, bookAuthor, etc.), errors (same as in BookModal)
- Methods:
  - handleChange, validate, handleSubmit (same as BookModal)
  - In handleSubmit, after calling onSave, navigate back to home (using `useNavigate`).
- Render:
  - Header (with a back link to home)
  - Form (same as BookModal content)

#### File: Client/Book-management/src/components/EditBookPage.jsx (new)

- Create this file.
- Props: `books` (array), `onSave` (function to save the book)
- Use `useParams` to get the `id` from the URL.
- Use `useEffect` to find the book by id in the `books` array and set form data.
- State: form data, errors (same as BookModal)
- Methods: same as AddBookPage (handleChange, validate, handleSubmit)
- In handleSubmit, after calling onSave, navigate back to home.
- Render:
  - Header (with a back link to home)
  - Form (same as BookModal content, pre-filled with book data)

#### File: Client/Book-management/src/components/Header.jsx (updated)

- Import: `{ NavLink } from 'react-router-dom'`
- Change the existing links to use `NavLink` for active styling.
- Add a link to "/add" for adding a book.
- We might want to conditionally show the "ADD NEW BOOK" button only on the home page? But let's keep it in the header for now and maybe hide it on the add/edit pages via a prop or by checking the current location.

  Alternatively, we can create two headers: one for home (with add book button) and one for add/edit pages (with back button). But let's keep it simple and pass a prop to Header to show/hide the add button.

  We'll add a prop `showAddButton` (default true) and set it to false in the add and edit pages.

  In Header:
  {showAddButton && (
  <button
  onClick={onOpenAddModal} // but wait, we are removing the modal
  className="nb-btn nb-btn-yellow" >
  <Plus className="w-5 h-5 stroke-[3]" />
  <span>ADD NEW BOOK</span>
  </button>
  )}

  But now we are removing the modal, so we cannot use `onOpenAddModal`. Instead, we should use `navigate` to go to "/add". So we need to pass a `navigate` function or use `useNavigate` inside Header.

  Let's change: Header will use `useNavigate` internally for the add button.

  Alternatively, we can pass an `onAddClick` prop from the parent.

  Let's do:

  In Header, we'll add a prop `onAddClick` (a function) and call it when the add button is clicked.

  Then in Home.jsx, we pass:
  onAddClick={() => navigate('/add')}

  And in AddBookPage and EditBookPage, we don't show the add button (so we pass `showAddButton={false}` or simply not pass the onAddClick).

  But we also want a back button in the header for add/edit pages. We can add a prop `showBackButton` and when true, show a button that goes back.

  Alternatively, we can just use the existing theme toggle and add a back button only in the add/edit pages.

  Let's redesign Header to be more flexible:

  Props:
  - `showAddButton` (boolean, default true): if true, shows the ADD NEW BOOK button.
  - `showBackButton` (boolean, default false): if true, shows a back button ( goes to previous page or home? We'll go back to home for simplicity).
  - `onAddClick` (function): called when add button is clicked.
  - `onBackClick` (function): called when back button is clicked.

  Then in Home.jsx:
    <Header 
        showAddButton={true}
        showBackButton={false}
        onAddClick={() => navigate('/add')}
        ...other props (bookCount, totalValue, theme, onToggleTheme)
    />

  In AddBookPage.jsx and EditBookPage.jsx:
    <Header 
        showAddButton={false}
        showBackButton={true}
        onBackClick={() => navigate('/')}
        ...other props
    />

  But note: the Header currently also has the theme toggle and the book count/total value. We need to pass `bookCount` and `totalValue` to Header only in the home page? Because in add/edit pages, we don't have that context.

  We can either:
  - Not show the book count and total value in the header on add/edit pages.
  - Or compute them from the books prop (if we pass books to header).

  Let's change Header to accept `bookCount` and `totalValue` as props and only display them if provided.

  Then in Home.jsx, we pass the current books length and total value.

  In AddBookPage and EditBookPage, we don't pass them (or pass 0 and 0) so they don't show.

  Alternatively, we can compute the total value in the header if we pass the books array. But for simplicity, let's just pass the numbers.

  We'll change Header to:
  - If `bookCount` and `totalValue` are provided, show the stats div.
  - Otherwise, don't show it.

  And the same for the add/back buttons.

#### File: Client/Book-management/src/components/BookList.jsx

- Remove the `onEdit` prop and instead, in BookCard, use `useNavigate` to navigate to `/edit/${book.id}` when the edit button is clicked.
- Remove the `onEdit` prop from BookList and pass down to BookCard? Actually, we can remove it entirely and handle the edit navigation inside BookCard.

#### File: Client/Book-management/src/components/BookCard.jsx

- Import: `{ useNavigate } from 'react-router-dom'`
- Inside the edit button's onClick, replace the call to `onEdit(book)` with:
  const navigate = useNavigate();
  navigate(`/edit/${book.id}`);

  And remove the `onEdit` prop from the component's destructuring and props.

### 6. Validation and State

- We must ensure that the `handleSaveBook` function in App.jsx (or wherever we keep it) works for both adding and editing.
  Currently, it does:

  ```javascript
  const handleSaveBook = (bookData) => {
    const targetId = bookData._id || bookData.id;
    if (editingBook) {
      // update
    } else {
      // add
    }
  };
  ```

  We are removing the `editingBook` state from App.jsx. So we need to change the logic in `handleSaveBook` to determine if we are updating or adding based on whether `bookData` has an `_id` or `id` that matches an existing book.

  Alternatively, we can pass a flag from the page (add vs edit) but let's keep it simple in the function.

  We can change `handleSaveBook` to:

  ```javascript
  const handleSaveBook = (bookData) => {
    // Check if bookData has an id that exists in books (and is not a new id like Date.now())
    const existingBookIndex = books.findIndex(
      (b) => (b._id || b.id) === (bookData._id || bookData.id),
    );
    if (existingBookIndex >= 0) {
      // update
      setBooks((prev) =>
        prev.map((b, index) =>
          index === existingBookIndex ? { ...b, ...bookData } : b,
        ),
      );
      addToast(`Updated details for "${bookData.bookName}"`, "success");
    } else {
      // add
      setBooks((prev) => [{ ...bookData, id: Date.now() }, ...prev]);
      addToast(`Added "${bookData.bookName}" to collection`, "success");
    }
  };
  ```

  But note: we are removing the `editingBook` state, so we don't have that flag anymore.

  However, we must be cautious: when adding, the bookData does not have an `_id` or `id` (we set it to Date.now() in the handler). When editing, we pass the bookData with the existing id.

  So the above logic should work.

  We'll move the `handleSaveBook` function to `App.jsx` and keep it there, then pass it down as a prop.

### 7. Toast Notifications

- The `toasts` state and the `addToast` and `handleDismissToast` functions are currently in App.jsx.
- We need to move them to a place where they can be accessed by all pages (Home, AddBookPage, EditBookPage).
- We can either:
  a) Keep them in App.jsx and pass down the `addToast` function as a prop to the pages and components that need it.
  b) Create a context for toasts.

  Given the scope, let's keep it simple and pass the `addToast` function as a prop.

  We'll add `addToast` as a prop to Home, AddBookPage, EditBookPage, and then to the components that need it (like BookModal is gone, but we have the form in the pages).

  Actually, the toast logic is in the form handling (in the pages). So we need to pass `addToast` to the pages.

  We'll adjust:

  In App.jsx:
  - Keep the `toasts` state and the `addToast`, `handleDismissToast` functions.
  - Pass `addToast` to Home, AddBookPage, EditBookPage.

  In Home.jsx, we already have the toast state and functions? Actually, we moved the home-related state to Home.jsx, but the toast state is still in App.jsx. We can either: - Move the toast state to App.jsx and pass it down, or - Keep the toast state in App.jsx and use it in the toast container in App.jsx, but then the pages need to trigger toasts.

  Let's keep the toast state and the toast container in App.jsx (so the toasts appear at the top level) and pass the `addToast` function down to the pages and components that need to show a toast.

  Then, in App.jsx, we keep:

  ```javascript
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'success') => { ... }, []);
  const handleDismissToast = useCallback((id) => { ... }, []);
  ```

  And we pass `addToast` as a prop to the pages.

  The toast container (the div that maps over toasts) remains in App.jsx.

### 8. BookList and Stats

- The `BookList` and `Stats` components are only used in the Home page, so they can remain as is, but we need to pass the necessary props from Home.jsx.

### 9. BookModal

- Since we are replacing the modal with pages, we can remove the `BookModal.jsx` file or keep it for reference? We'll remove it because we are not using it anymore.

### 10. CSS and styling

- We are reusing the existing components (Header, BookList, etc.) so the styling should remain consistent.

### Summary of File Changes

**New Files:**

- `src/components/Home.jsx`
- `src/components/AddBookPage.jsx`
- `src/components/EditBookPage.jsx`

**Modified Files:**

- `src/App.jsx` - add router, remove modal state, adjust props and state handling.
- `src/components/Header.jsx` - add props for conditional rendering of buttons and stats, use `useNavigate` for buttons.
- `src/components/BookList.jsx` - remove `onEdit` prop.
- `src/components/BookCard.jsx` - use `useNavigate` to navigate to edit page on edit button click.
- Remove `src/components/BookModal.jsx` (since we are using pages instead).

### 11. Validation and Testing

- After implementing, we should test:
  - Navigating between home, add, and edit pages via links and directly via URL.
  - Adding a new book from the add page and seeing it appear in the home list.
  - Editing a book from the edit page and seeing the changes in the home list.
  - Deleting a book from the home page.
  - Toggling favorite status.
  - Ensuring that the header shows the correct buttons and stats on each page.

### 12. Notes

- We are not implementing a detailed book view page (like `/books/:id`) because the requirement was for basic routing and the current app doesn't have a detail view.
- We are keeping the existing state management in `App.jsx` for simplicity. For a larger app, we might consider using a state management library or React Context.

### Files to Create/Modify

1. `Client/Book-management/src/App.jsx`
2. `src/components/Header.jsx`
3. `src/components/BookList.jsx`
4. `src/components/BookCard.jsx`
5. `src/components/Home.jsx` (new)
6. `src/components/AddBookPage.jsx` (new)
7. `src/components/EditBookPage.jsx` (new)
8. Delete: `src/components/BookModal.jsx`

## Verification Steps

1. Run the client: `npm run dev` in the Client/Book-management directory.
2. Check that the home page loads at `/`.
3. Click the "ADD NEW BOOK" button in the header (or navigate to `/add`) and verify the add book form appears.
4. Submit the form to add a new book and verify it appears in the list.
5. Click the edit button on a book card and verify it navigates to `/edit/:id` with the form pre-filled.
6. Submit the edit form and verify the changes are reflected in the list.
7. Delete a book and verify it is removed.
8. Toggle favorite and verify the star changes.
9. Test direct URL access (e.g., go directly to `/add` or `/edit/1`).
10. Test the browser's back and forward buttons.

## Risks and Considerations

- State management: We are keeping the book state in `App.jsx` and passing it down. This is acceptable for a small app but may become cumbersome as the app grows.
- The edit page relies on the `books` prop being up-to-date. Since we are passing the `books` state from `App.jsx` and updating it via `setBooks`, the edit page will re-render with the updated book data when the books change.
- We are not handling the case where a book is deleted while on its edit page. We might want to redirect to home if the book is no longer found. We can add a check in `EditBookPage`: if the book is not found, navigate to home and show a toast.

Let's proceed with the plan.

Now, we will write the plan to the plan file.
