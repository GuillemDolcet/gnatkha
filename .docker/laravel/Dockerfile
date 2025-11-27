FROM php

COPY ./start-container /usr/local/bin/start-container

RUN chmod ugo+x /usr/local/bin/start-container

RUN mkdir -p /srv/www/backend

RUN chown -R www-data:www-data /srv/www/backend \
    && chmod -R u+rw /srv/www/backend \
    && chmod -R g+rw /srv/www/backend \
    && chmod -R go-w /srv/www/backend

RUN chown -R www-data:www-data /var/log/apache2

RUN mkdir -p /var/run/apache2 && chown -R www-data:www-data /var/run/apache2

USER www-data

WORKDIR /srv/www/backend

ENTRYPOINT [ "/usr/local/bin/start-container" ]

EXPOSE 5000
