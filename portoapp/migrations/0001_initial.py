# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2017-09-17 18:57
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PortoPoints',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tripid', models.IntegerField()),
                ('segmentid', models.IntegerField(blank=True, null=True)),
                ('pointtime', models.DateTimeField(blank=True, null=True)),
                ('pointspeed', models.FloatField(blank=True, null=True)),
                ('pointgeo', django.contrib.gis.db.models.fields.PointField(blank=True, geography=True, null=True, srid=0)),
                ('zipcode', models.CharField(blank=True, max_length=12, null=True)),
            ],
            options={
                'db_table': 'porto_points',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='PortoSegments',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('segmentid', models.IntegerField(blank=True, null=True)),
                ('streetid', models.IntegerField(blank=True, null=True)),
            ],
            options={
                'db_table': 'porto_segments',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='PortoStreets',
            fields=[
                ('streetid', models.IntegerField(primary_key=True, serialize=False)),
                ('streetname', models.TextField(blank=True, null=True)),
                ('streetgeo', django.contrib.gis.db.models.fields.GeometryField(blank=True, geography=True, null=True, srid=0)),
                ('streettype', models.CharField(blank=True, max_length=20, null=True)),
            ],
            options={
                'db_table': 'porto_streets',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='PortoTrips',
            fields=[
                ('tripid', models.IntegerField(primary_key=True, serialize=False)),
                ('taxiid', models.IntegerField(blank=True, null=True)),
                ('trippoints', django.contrib.gis.db.models.fields.GeometryField(blank=True, geography=True, null=True, srid=0)),
                ('triplength', models.FloatField(blank=True, null=True)),
                ('starttime', models.DateTimeField(blank=True, null=True)),
                ('endtime', models.DateTimeField(blank=True, null=True)),
                ('startpoint', django.contrib.gis.db.models.fields.PointField(blank=True, geography=True, null=True, srid=0)),
                ('endpoint', django.contrib.gis.db.models.fields.PointField(blank=True, geography=True, null=True, srid=0)),
            ],
            options={
                'db_table': 'porto_trips',
                'managed': False,
            },
        ),
    ]
