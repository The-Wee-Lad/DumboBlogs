# DumboBlogs

DumboBlogs is a basic blogging website that incorporates user authentication and full CRUD (Create, Read, Update, Delete) functionalities. The frontend is developed using Embedded JavaScript (EJS) templates and is served through server-side rendering.

## Features

- **User Authentication**: Secure user registration and login system.
- **CRUD Operations**: Users can create, read, update, and delete blog posts.
- **Server-Side Rendering**: Dynamic content generation using EJS templates.
- **MongoDB Integration**: Stores user data and blog posts efficiently.
- **Responsive Design**: Works well on different screen sizes.

## Technologies Used

- **JavaScript**: Primary programming language.
- **CSS**: Styling and layout.
- **EJS**: Templating engine for server-side rendering.
- **Node.js & Express**: Backend framework.
- **MongoDB**: Database for storing blog posts and user data.
- **Passport.js**: Authentication middleware.

## Getting Started

To set up the project locally:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/The-Wee-Lad/DumboBlogs.git
   ```

2. **Navigate to the project directory**:

   ```bash
   cd DumboBlogs
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Set up environment variables**:

   Create a `.env` file in the root directory and add necessary environment variables such as database connection strings and secret keys.

5. **Start the development server**:

   ```bash
   npm start
   ```

6. **Access the application**:

   Open your browser and go to `http://localhost:3000` to view the app.

## Deployment

DumboBlogs is deployed and accessible at:

**[Live Demo](https://dumboblogs.onrender.com/api/v1/home?page=1)**

To deploy your own instance:

1. Choose a cloud platform like **Heroku, Vercel, or AWS**.
2. Set up environment variables for production.
3. Push your code and configure the database.
4. Deploy and test the application.

## Project Structure

```
DumboBlogs/
├── .vscode/          # VS Code workspace settings
├── src/             # Main source code directory
│   ├── routes/      # Express routes
│   ├── models/      # Database models
│   ├── views/       # EJS templates for rendering pages
│   ├── public/      # Static files (CSS, images, JS)
│   ├── controllers/ # Business logic handling
├── .gitignore       # Files and directories ignored by Git
├── package-lock.json # Dependency lock file
├── package.json     # Project metadata and dependencies
├── README.md        # Project documentation
└── server.js        # Main server file
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

Thanks to all contributors and the open-source community for their support.
