# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Book Management System repository.

## Overview

This is a MERN (MongoDB, Express, React, Node.js) stack Book Management System with:

- **Backend**: Express.js server with MongoDB/Mongoose for data persistence
- **Frontend**: React application built with Vite and styled with Tailwind CSS
- **Architecture**: Separated client and server folders with RESTful API communication

## Project Structure

```
/Book-Management-System
  ├── /Server                # Express.js backend
  │   ├── controllers/       # Request handlers
  │   ├── models/            # Mongoose schemas
  │   ├── routes/            # API route definitions
  │   ├── database.js        # MongoDB connection
  │   ├── index.js           # Server entry point
  │   ├── package.json       # Backend dependencies
  │   └── .env               # Environment variables
  │
  └── /Client                # React frontend
      └── /Book-management   # Vite/React application
          ├── src/           # Source code
          │   ├── App.jsx    # Main application component
          │   ├── main.jsx   # Entry point
          │   └── index.css  # Global styles
          ├── index.html     # HTML template
          ├── package.json   # Frontend dependencies
          └── vite.config.js # Vite configuration
```

## Development Commands

### Backend (Server)

```bash
# Install dependencies
npm install

# Start development server (with nodemon)
npm start

# Server runs on http://localhost:3000
```

### Frontend (Client)

```bash
# Navigate to client directory
cd Client/Book-management

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### API Endpoints

All book-related endpoints are prefixed with `/books`:

- `GET /books` - Retrieve all books
- `POST /books` - Create a new book
- `PUT /books/:id` - Update a book by ID
- `DELETE /books/:id` - Delete a book by ID

## Book Model Schema

Each book document has:

- `bookName` (String, required)
- `bookAuthor` (String, required)
- `bookPrice` (Number, required)
- `publishDate` (Date, optional)

## Technology Stack

### Backend

- Node.js runtime
- Express.js web framework
- MongoDB database with Mongoose ODM
- dotenv for environment variable management
- nodemon for development

### Frontend

- React 18+ with Vite bundler
- Tailwind CSS for styling
- ES6+ JavaScript

## Common Development Tasks

### Adding New Features

1. **Backend**:
   - Define routes in `/Server/routes/`
   - Implement controller logic in `/Server/controllers/`
   - Modify Mongoose schema in `/Server/models/` if needed

2. **Frontend**:
   - Create components in `/Client/Book-management/src/`
   - Update App.jsx for routing/navigation
   - Use Tailwind CSS for styling
   - Fetch data from `/books` endpoints using fetch/axios

### Database Operations

- MongoDB connection is handled in `/Server/database.js`
- Mongoose models are in `/Server/models/`
- Controllers handle CRUD operations using Mongoose methods

### Styling Guidelines

- Use Tailwind CSS utility classes for styling
- Follow existing component patterns in `/Client/Book-management/src/`
- Maintain responsive design principles

## Code Quality Guidelines

### Backend

- Use async/await for asynchronous operations
- Handle errors with try/catch blocks
- Validate request data before processing
- Follow RESTful API design principles
- Keep controllers focused on request/response handling

### Frontend

- Use functional components with React hooks
- Follow React best practices for state management
- Use Tailwind utility classes consistently
- Keep components small and focused
- Use proper error handling for API calls

## Environment Variables

Create a `.env` file in the Server directory with:

```
MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name
PORT=3000
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Verify MongoDB URI in .env file
   - Ensure MongoDB service is running
   - Check network connectivity to MongoDB instance

2. **Port Conflicts**
   - Default server port is 3000
   - Default Vite dev server port is 5173
   - Change ports in configuration files if needed

3. **CORS Issues**
   - Ensure CORS middleware is properly configured if needed
   - Check that frontend and backend ports are correctly configured

## Getting Started

1. Clone the repository
2. Install dependencies for both server and client:
   ```bash
   npm install
   cd Client/Book-management
   npm install
   ```
3. Set up environment variables in Server/.env
4. Start both development servers:
   ```bash
   # In root directory
   npm start

   # In another terminal
   cd Client/Book-management
   npm run dev
   ```
5. Access the application at http://localhost:5173 (frontend) and http://localhost:3000 (backend API)

## Future Enhancements

- Add authentication and authorization
- Implement form validation
- Add loading states and error handling in UI
- Implement search and filter functionality
- Add unit and integration tests
- Deploy to production environment
