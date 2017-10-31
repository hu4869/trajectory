var vis = vis || {};

vis._Query = {};
vis._Query.NextGUID = 0;

vis.Query = function(shapeLayers/*, extraLayers, color*/) {
    var Query = this;
    this.GUID = vis._Query.NextGUID++;
    this.QueryId = -1;
    this.Color = null;
    this.parameters = null;
    this.Results = null;
    this.WeekDays = null;
    this.DayHours = null;
    this.Trip_Rank=null;
    this.St_Rank_count=null;
    this.St_Rank_speed=null;
    this.road_Array=null;
    this.Highlight = false;
    this.Visible = true;
	this.Vis = false;
    this.Qtype=null;
    this.Complex=0;
    //this.extra_query=[];
    this.DOMLink = {};   
    this.Name = null;    
    this.LayerGroups = [];
    this.LayerGroups.push(shapeLayers);//Farah For Delete
    this.extraLayers = [];
    
    
    
    
};