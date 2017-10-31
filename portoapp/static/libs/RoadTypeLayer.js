function prepareRoadTypeLayer(){
	//living_street
	RoadTypeLayer[0] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<living_street.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[living_street[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": living_street[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[0].addLayer(polylines);
	
	
	//motorway
	RoadTypeLayer[1] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<motorway.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[motorway[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": motorway[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[1].addLayer(polylines);
	
	
	//primary
	RoadTypeLayer[2] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<primary.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[primary[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": primary[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[2].addLayer(polylines);
	
		
	//residential
	RoadTypeLayer[3] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<residential.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[residential[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": residential[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[3].addLayer(polylines);
	
	//road
	RoadTypeLayer[4] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<road.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[road[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": road[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[4].addLayer(polylines);
	
	//secondary
	RoadTypeLayer[5] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<secondary.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[secondary[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": secondary[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[5].addLayer(polylines);
	
	//service
	RoadTypeLayer[6] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<service.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[service[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": service[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[6].addLayer(polylines);
	
	//tertiary
	RoadTypeLayer[7] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<tertiary.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[tertiary[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": tertiary[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[7].addLayer(polylines);
	
	
	//trunk
	RoadTypeLayer[8] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<trunk.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[trunk[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": trunk[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[8].addLayer(polylines);
	
	
	//unclassified
	RoadTypeLayer[9] = new L.FeatureGroup();
	var Trajectories = []
	for (var j=0; j<unclassified.length; j++) { 
	var polylinePoints = [];
	var Traj = RID[unclassified[j].toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": unclassified[j]},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[9].addLayer(polylines);
	
	//All
	RoadTypeLayer[10] = new L.FeatureGroup();
	var Trajectories = []
	for (var key in RID) {
	var polylinePoints = [];
	var Traj = RID[key.toString()].split(',');
	var polylinePoints = [];
	for (var i = 0; i < Traj.length; i++) {
		T = Traj[i].split(' ');
		polylinePoints.push([T[0], T[1]]);
	}
	var TempT = {
		"type": "LineString",
		"properties": {"id": RID},
		"coordinates": polylinePoints
	}
	Trajectories.push(TempT);
	}
	var polylines = L.geoJson(Trajectories, {
			style: {
				color: 'red',
				weight: 4,
				opacity: 0.5
			}
	});
	RoadTypeLayer[10].addLayer(polylines);
	
}
