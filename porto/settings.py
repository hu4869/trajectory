"""
Django settings for porto project.

Generated by 'django-admin startproject' using Django 1.11.5.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 's)3w4tie+!n!p9*%7_3700b^#upt*p+#6ll1b2oo5qu)qcl^@f'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'leaflet',
    'portoapp',
    # 'livereload',
]

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'livesync.core.middleware.DjangoLiveSyncMiddleware'
    # 'livereload.middleware.LiveReloadScript',
]

ROOT_URLCONF = 'porto.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR,  'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'porto.wsgi.application'

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'my_cache_table',
    }
}

# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
#         'LOCATION': '127.0.0.1:11211',
#     }
# }

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }

DATABASES = {
    'default': {
         'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'HOST': '10.18.202.210',
        'PORT': '5434',
         'NAME': 'Porto_Taxi',
         'USER': 'postgres',
         'PASSWORD': 'user',
    },
}

# DATABASES = {
#     'default': {
#          'ENGINE': 'django.contrib.gis.db.backends.postgis',
#          'NAME': 'Porto_Taxi',
#          'USER': 'postgres',
#          'PASSWORD': 'user',
#             'PORT':'5433'
#     },
# }


# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/
STATIC_URL = '/porto/static/'
STATIC_ROOT = '/portoapp/static/'

TEMPLATE_DIRS = (
    os.path.join(BASE_DIR,  'templates'),
)

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))

js_list = [line.strip() for line in open(os.path.join(PROJECT_ROOT, 'js_list'))]
LEAFLET_CONFIG = {
    'DEFAULT_CENTER': (41.155376, -8.613999),
    'DEFAULT_ZOOM': 15,
    'TILES': [('street', 'https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ',{'attributions': '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
              ('light', 'https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ',{'attributions': '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
              ('google', 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {'attribute':'google'})],
    'SPATIAL_EXTENT': (-8.55, 41.1, -8.67, 41.2),
    'MIN_ZOOM': 3,
    'MAX_ZOOM': 20,
    'RESET_VIEW': True,
    'PREFERCANVAS': True,
    # 'SCALE': 'both',
    # 'MINIMAP': True,
    'PLUGINS': {
        'draw': {
                'css': 'css/leaflet.draw.css',
                'js': js_list,
                'auto-include': True,
            },
        'easy-button': {
                'css': 'css/easy-button.css',
                'js': 'libs/easy-button.js',
                'auto-include': True,
            }
        },
    }