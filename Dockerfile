# Use the official PHP image
FROM php:7.4-apache

# Copy the content of the project to the Apache web root
COPY ./frontend /var/www/html

# Expose port 8000 instead of default 80
EXPOSE 8000

# Change Apache to run on port 8000 by editing the default config file
RUN sed -i 's/80/8000/' /etc/apache2/sites-available/000-default.conf

# Restart Apache with the new configuration
CMD ["apache2ctl", "-D", "FOREGROUND"]