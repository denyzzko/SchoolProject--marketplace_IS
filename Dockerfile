#PHP image
FROM php:7.4-apache

# Copy frontend and backend directory to root
COPY ./frontend /var/www/html
COPY ./backend /var/www/html/backend

# permissions
RUN chown -R www-data:www-data /var/www/html

# port 80 for traffic
EXPOSE 80