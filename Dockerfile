# Use the official PHP image
FROM php:7.4-apache

# Copy the content of the project to the Apache web root
COPY ./frontend /var/www/html

# Expose port 80 to allow traffic
EXPOSE 80