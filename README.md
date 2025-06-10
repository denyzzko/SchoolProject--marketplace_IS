# Agricultural Marketplace Web IS

This project is a web-based application. It represents a role-based agricultural marketplace platform with database-backed functionality.

## Description

The system supports multiple user roles:

- **Admin** – manages users and categories.
- **Moderator** – reviews category proposals and moderates offers.
- **Farmer** – adds and manages product offers.
- **Customer** – browses and purchases goods.

The backend is written in PHP and uses a MySQL database defined in the `database/schema.sql` file. The frontend uses HTML, CSS and JavaScript.

## Features

- User registration and login
- Role-based access control
- Product offer management and self-picking events
- Reviews and orders
- Category hierarchy with admin/moderator validation

## Running the Project

### 1. Start PHP Development Server

```bash
php -S localhost:8000
```

Visit:
```
http://localhost:8000/index.html
```

### 2. Set Up the Database

1. Import the schema:
   ```sql
   mysql -u youruser -p yourdatabase < database/schema.sql
   ```

2. Adjust database connection settings in `backend/db.php`

## File Structure

- `assets/` – Images and other media
- `backend/` – PHP server logic
- `database/schema.sql` – SQL script to initialize the database
- `frontend/` – HTML structure & JavaScript
- `styles/` – Additional CSS files
- `doc.html` – Project documentation
- `index.html` – Homepage
- `styles.css` – Main stylesheet

## Authors

- Denis Milistenfer `<xmilis00@stud.fit.vutbr.cz>`
- Robert Zelnicek `<xzelni06@stud.fit.vutbr.cz>`
- Tomas Potucek `<xpotuc08@stud.fit.vutbr.cz>`

