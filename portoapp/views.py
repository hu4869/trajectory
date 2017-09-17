from django.shortcuts import render
from portoapp import models
from django.http import HttpResponse
import json

from django_pandas.io import read_frame

def index(request):
    request.session['trip'] = None
    request.session['segment'] = None
    return render(request, 'index.html', {'a': 1})

def query(request):
    para = json.loads(request.POST['val'])

    trips = models.PortoTrips.objects.order_by('-length')\
        .filter(starttime__in=para['time_range'][0]);

    extra = 'ST_%{func}s({col}::geography, %{area}s)'
    val = {}
    area = para['area']
    if (type(area) == type({})):
        val['func'] = 'dwithin'
        val['area'] = 'ST_makepoint(%{lat}s, %{lng}s), %{r}s)'%area
    else:
        val['func'] = 'contains'
        val['area'] = 'ST_GeomFromText('+','.join([str(a[0])+' '+str(a[1]) for a in area])+')'

    if area.start:
        val['area'] = 'startpoint'
        trips.extra(extra)

    # get trips information for aggregation
    m_trip = read_frame(trips)
    request.session['trip'] = m_trip

    # get streets aggregate information table information
    models.PortoPoints.objects.filter(tripid__in=m_trip['tripid'])
    m_segs = read_frame(models).groupby('segmentid').tripid.unique()
    request.session['segment'] = m_segs

    tids = m_trip['tripid'].apply(list)
    sids = m_segs['segmentid'].apply(list)

    return HttpResponse(json.dumps({
        trips
    }), content_type="application/json")

def get_by_ids(request):
    para = json.loads(request.POST['val'])
    target = request.POST['target']
    db = request.session[target]

    l = db[db[id].isin(para)]
    if target == 'trip':
        res = {
            trip: l['']
        }

    return HttpResponse(json.dumps(l), content_type="application/json")


