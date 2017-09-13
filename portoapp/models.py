# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desidered behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.contrib.gis.db import models
class PortoPoints(models.Model):
    tripid = models.IntegerField()
    segmentid = models.IntegerField(blank=True, null=True)
    pointtime = models.DateTimeField(blank=True, null=True)
    pointspeed = models.FloatField(blank=True, null=True)
    pointgeo = models.GeometryField(srid=0, blank=True, null=True)
    zipcode = models.CharField(max_length=12, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'porto_points'


class PortoSegments(models.Model):
    segmentid = models.IntegerField(blank=True, null=True)
    streetid = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'porto_segments'


class PortoStreets(models.Model):
    streetid = models.IntegerField(primary_key=True)
    streetname = models.TextField(blank=True, null=True)
    streetgeo = models.GeometryField(srid=0, blank=True, null=True)
    streettype = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'porto_streets'


class PortoTrips(models.Model):
    tripid = models.IntegerField(primary_key=True)
    taxiid = models.IntegerField(blank=True, null=True)
    trippoints = models.GeometryField(srid=0, blank=True, null=True)
    triplength = models.FloatField(blank=True, null=True)
    starttime = models.DateTimeField(blank=True, null=True)
    endtime = models.DateTimeField(blank=True, null=True)
    startpoint = models.GeometryField(srid=0, blank=True, null=True)
    endpoint = models.GeometryField(srid=0, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'porto_trips'