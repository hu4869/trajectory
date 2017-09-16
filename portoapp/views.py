from django.shortcuts import render
from django.template import RequestContext
from portoapp import models
# Create your views here.
def index(request):
    return render(request, 'index.html', {'a': 1}, context_instance=RequestContext(request))

def query(request):
    para = request.POST;
    models.PortoTrips.startpoint