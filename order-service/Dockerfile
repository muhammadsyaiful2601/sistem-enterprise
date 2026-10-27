FROM php:8.2-fpm

# Install dependensi sistem dan ekstensi pdo_mysql
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

RUN docker-php-ext-install pdo_mysql mbstring exclam

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-interaction --optimize-autoloader

EXPOSE 3003

CMD php artisan serve --host=0.0.0.0 --port=3003