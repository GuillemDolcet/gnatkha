FROM ubuntu

RUN add-apt-repository ppa:ondrej/php \
    && apt-get update \
    && apt-get install -y php8.4-cli php8.4-common php8.4-curl php8.4-gd \
        php8.4-intl php8.4-mbstring php8.4-opcache php8.4-pgsql \
        php8.4-readline php8.4-soap php8.4-xml php8.4-zip php8.4-bcmath \
        php8.4-tidy php8.4-ssh2 php8.4-memcached php8.4-redis \
        apache2 libapache2-mod-php8.4 php8.4-xdebug \
    && apt-get clean \
    && apt-get autoclean \
    && apt-get autoremove -y --purge \
    && rm -fr /var/lib/apt/lists/*

# PHP settings
RUN echo -e "\
; Enable opcache + JIT\n\
opcache.enable=1\n\
opcache.enable_cli=1\n\
opcache.jit_buffer_size=128M\n\
opcache.jit=tracing" >> /etc/php/8.4/cli/conf.d/10-opcache.ini

RUN php -r "readfile('http://getcomposer.org/installer');" | php -- --install-dir=/usr/local/bin/ --filename=composer

COPY 000-default.conf /etc/apache2/sites-available/000-default.conf
COPY servername.conf /etc/apache2/conf-available/servername.conf

RUN a2enconf servername

RUN a2ensite 000-default.conf \
    && a2enmod rewrite

RUN echo -e "\
; Xdebug configuration\n\
xdebug.mode=debug\n\
xdebug.start_with_request=yes\n\
xdebug.client_port=9003\n\
xdebug.client_host=host.docker.internal\n\
xdebug.idekey=docker\n\
xdebug.log=/var/log/xdebug.log" >> /etc/php/8.4/apache2/conf.d/20-xdebug.ini

RUN echo -e "\
; Xdebug configuration for CLI\n\
xdebug.mode=debug\n\
xdebug.start_with_request=yes\n\
xdebug.client_port=9003\n\
xdebug.client_host=host.docker.internal\n\
xdebug.idekey=docker\n\
xdebug.log=/var/log/xdebug.log" >> /etc/php/8.4/cli/conf.d/20-xdebug.ini

RUN sed -i "s/Listen 80/Listen 5000/" /etc/apache2/ports.conf

WORKDIR /
