# Use a PHP image that has PostgreSQL support
FROM php:7.4-apache

# Install the PostgreSQL PDO extension
RUN docker-php-ext-install pdo pdo_pgsql

# Copy your application files to the web server
COPY ./frontend /var/www/html
COPY ./backend /var/www/html/backend

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port 80 to allow traffic
EXPOSE 80
