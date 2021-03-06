from django.shortcuts import render
from django.http import HttpResponse
import json
from django.core.cache import cache
from django.db import connection
import pandas as pd
import time

def index(request):
    return render(request, 'index.html', {'a': 1})

def query(request):
    para = json.loads(request.POST['val'])

    # store each query by queryID and trip ids


    conf = {
        'start_time': para['time_range'][0],
        'end_time': para['time_range'][1],
        'sort': para['sort'],
        'desc': para['desc']
    }

    area = para['area']

    if type(area) == type({}):
        # this is a circle
        conf['func'] = "st_dwithin(%(target)s::geography, "+"ST_makepoint(%(lng)s,%(lat)s), %(r)s)"%area
    else:
        area = area[0]
        area.append(area[0])
        conf['func'] = 'st_contains(st_geomfromtext(\'polygon((%s))\', 4326),'%','.join(['%(lng)s %(lat)s'%a for a in area])+' %(target)s)'
    geo = []
    if para['start']:
        geo.append(conf['func'] % {'target':'startpoint'})
    if para['end']:
        geo.append(conf['func'] % {'target':'endpoint'})
    conf['geo'] = ' or '.join(geo)

    query = "select tripid, taxiid, triplength, starttime, endtime, " \
            "ST_AsGeojson(startpoint) as startpoint, ST_AsGeojson(endpoint) as endpoint from porto_trips where " \
            "starttime >='%(start_time)s' and starttime<='%(end_time)s' " \
            "and (%(geo)s) order by %(sort)s %(desc)s"%conf

    # get trip information is ready too slow, store it.
    print(query)
    t0 = time.time()
    tmp = pd.read_sql(query, connection, index_col='tripid')
    try:
        db = cache.get('trip')
        m_trip = pd.concat([tmp, db]).drop_duplicates()
    except Exception:
        m_trip = tmp
    try:
        eq = cache.get('eq')
        eq[request.POST['queryID']] = set(tmp.index.values)
    except Exception:
        eq = {}
        eq[request.POST['queryID']] = set(tmp.index.values)

    t1 = time.time()
    print ('query', t1-t0)

    t0 = time.time()
    cache.set('eq',eq)
    cache.set('trip', m_trip)
    # store query in session, redo query when cache is timeout
    request.session['query'] = query
    t1 = time.time()
    print('cache set: ', t1 - t0)

    res = tmp.index.values.tolist()
    return HttpResponse(json.dumps(res), content_type="application/json")


def clear(request):
    if request.POST['qid']:
        qid = request.POST['qid']
        eq = cache.get('eq')
        tripid = eq.pop(qid)
        cache.set('eq',eq)

        for q in eq.values():
            tripid = tripid-q

        # for id in tripid:
        trip = cache.get('trip')
        trip.drop(trip.index[tripid])
        cache.set('trip',trip)
    else:
        cache.delete('trip')


def get_by_ids(request):
    para = json.loads(request.POST['val'])
    target = request.POST['target']

    if target == 'trip':
        res = get_trips_by_ids(para)
    else:
        res = get_segment_by_ids(para)

    return HttpResponse(json.dumps(res), content_type="application/json")

def get_segment_by_ids(ids):
    db = cache.get('segment')
    l = db[db['segmentid'].isin(ids)]
    # get profile in street table
    ids = l['segmentid'].tolist()
    m_segment = pd.read_sql(
        'select segmentid, tripid from portopoints where tripid in (%s)'
        % ','.join([str(i) for i in ids]))
    return {
        'id:': ids,
        'segment': l['segmentpoints'].tolist()
    }

def get_trips_by_ids(ids):
    t0 = time.time()
    query = 'select tripid, ST_AsGeojson(trippoints) as points, ' \
            'ST_AsGeojson(startpoint) as startpoint, ST_AsGeojson(endpoint) as endpoint' \
            ' from porto_trips where tripid in (%s)'\
            %','.join([str(i) for i in ids])
    l = pd.read_sql(query, connection)

    # db = cache.get('trip')
    # l = db[db['tripid'].isin(ids)]

    t1 = time.time()
    print('cache get: ', t1-t0)

    return {
        'id': l['tripid'].tolist(),
        'trip': l['points'].tolist(),
        'start': l['startpoint'].tolist(),
        'end': l['endpoint'].tolist()
    }

# aggregate trips id into barchart bins
# group by hour, weekday
from math import log
from datetime import date, datetime

import calendar
def get_side_bar(request):
    ids = json.loads(request.POST['val'])

    db = cache.get('trip')
    res = db[['starttime', 'endtime', 'triplength']][db.index.isin(ids)]

    hourData = [[] for _ in range(24)]
    weekData = [[] for _ in range(7)]
    scatterData = []

    for index, row in res.iterrows():
        hd = pd.date_range(row['starttime'],row['endtime'],freq='H')
        for t in hd:
            h = t.hour
            hourData[h].append(int(index))

        dd = pd.date_range(row['starttime'],row['endtime'])
        for t in dd:
            d = t.weekday()
            weekData[d].append(int(index))

        td = pd.Timedelta(row['endtime']-row['starttime']).seconds / 60.0
        scatterData.append({'tripid': int(index),'trip_duration':td, 'trip_length':row['triplength']/1000})

    res1 = {
        'hour': hourData,
        'week': weekData,
        'scatter': scatterData,
    }

    return HttpResponse(json.dumps(res1), content_type="application/json")
