FROM php:8.2-fpm

# Install dependencies sistem dan ekstensi PHP yang dibutuhkan (pdo_mysql)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libzip-dev \
    && docker-php-ext-install pdo_mysql zip exts

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy kode aplikasi order-service
COPY . .

# Install dependencies composer
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Atur permission folder storage dan bootstrap/cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 3003

# Script startup: jalankan migrasi database lalu jalankan php artisan serve di port 3003
CMD sh -c "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=3003"