
function getRandom(){
    return Math.floor(Math.random() * 18);
}

var rainbow = ["#800000", "#FF0000", "#FFA500", "#FFFF00", "#808000", "#008000", "#800080", "#FF00FF", "#008080", "#00FFFF", "#0000FF", "#000080", "#000000", "#808080", "#C71585", "#483D8B", "#008B8B", "#8B4513"];

var vis = vis || {};

vis.QueryManager = new(function() {
    var self = this;
    this.Querys = [];
    this.hided = null;
    this.nextQueryColor = rainbow[getRandom()];//'#' + Math.floor(0x1000000 * Math.random()).toString(16);
    this.Init = function() {
        var color = this.nextQueryColor
        //var color = vis.QueryManager.GetNextColor();
        changeselectioncolor(color);
    }
    //Farah For Delete
    this.CreateQuery = function(selectionLayers, /*extraLayers,*/ color) {
        var newQuery = new vis.Query(selectionLayers /*, extraLayers, color*/ );
        newQuery.QueryId = ++QueryId;
        newQuery.Name = "Query " + QueryId;
        newQuery.Color = color
        this.AddQuery(newQuery);
        this.AddQueryControl(newQuery);
        this.nextQueryColor = rainbow[getRandom()];//'#' + Math.floor(0x1000000 * Math.random()).toString(16);
        changeselectioncolor(this.nextQueryColor);
		for (var i = 0; i < QueryId; i++) {
			hideQ(this.GetQueryById(i));
		}
        return newQuery;
    }
    //Farah for hide and show
    this.ToggleQueryVisibility = function(Query) {
		for (var i = 0; i <= QueryId; i++) {
			hideQ(this.GetQueryById(i));
		}
		this.AddQueryToMap(Query);
		Query.DOMLink['hide'].removeClass("iconShow");
		Query.DOMLink['hide'].removeClass("iconActive");
		Query.DOMLink['hide'].addClass("iconHide");
		VisSelected = []
		VisSelected.push(Query.QueryId);
		DrawChart();
		ActiveQID = Object.create(Query);
		TempQO = Object.create(Query);
		//DrawStreet(Query.road_Array);
		if (AvtiveVis == 1) {
			DrawStreet(ActiveQID.road_Array);
		} else if (AvtiveVis == 2) {
			DrawStreet1(ActiveQID.road_Array, ActiveQID.Color);
		} else if (AvtiveVis == 3) {
			DrawPick(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
		} else if (AvtiveVis == 4) {
			DrawDrop(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
		} else if (AvtiveVis == 5) {
			DrawTraj1(ActiveQID.Results, ActiveQID.QueryId, ActiveQID.color);
		}
		tabledata(Query.St_Rank_count, Query.St_Rank_speed, Query.Trip_Rank);
		
		/*
        Query.Visible = !Query.Visible;
        if (Query.Visible) {
            this.AddQueryToMap(Query);
            Query.DOMLink['hide'].removeClass("iconShow");
            Query.DOMLink['hide'].removeClass("iconActive");
            Query.DOMLink['hide'].addClass("iconHide");
            if (this.hided == Query.QueryId) {
                VisSelected = []
                VisSelected.push(Query.QueryId);
                DrawChart();
            }
        } else {
            Query.DOMLink['hide'].removeClass("iconHide");
            Query.DOMLink['hide'].addClass("iconActive");
            Query.DOMLink['hide'].addClass("iconShow");
            //var Vindex = VisSelected.indexOf(Query.QueryId);
            //VisSelected.splice(Vindex, 1);
            if (VisSelected[0] == Query.QueryId) {
                this.hided = Query.QueryId
                VisSelected = []
                DrawChart();
            }
            this.RemoveQueryFromMap(Query);
        }*/

    }
    this.ToggleQueryVis = function(Query) {
        Query.Vis = !Query.Vis;
        if (Query.Vis) {
            Query.DOMLink['se'].addClass("iconActive");
            VisSelected = []
            VisSelected.push(Query.QueryId);
            DrawChart()


        } else {
            Query.DOMLink['se'].removeClass("iconActive");
            VisSelected = []
            //console.log(this.Querys.length-1)
            VisSelected.push(this.Querys[this.Querys.length - 1].QueryId);
            DrawChart()

        }

    }
    //Farah for Hide and Show
    this.AddQueryToMap = function(Query) {
        for (var i = 0; i < Query.LayerGroups.length; i++) {
            try {
                if (Query.LayerGroups[i] != null)
                    map.addLayer(Query.LayerGroups[i]);
            } catch (e) {}
        }
        for (var i = 0; i < Query.extraLayers.length; i++) {
            try {
                if (Query.extraLayers[i] != null)
                    map.addLayer(Query.extraLayers[i]);
            } catch (e) {}
        }
    }
    //Farah For Delete
    this.RemoveQueryFromMap = function(Query) {
        for (var i = 0; i < Query.LayerGroups.length; i++) {
            try {
                if (Query.LayerGroups[i] != null)
                    map.removeLayer(Query.LayerGroups[i]);
            } catch (e) {}
        }
        for (var i = 0; i < Query.extraLayers.length; i++) {
            try {
                if (Query.extraLayers[i] != null)
                    map.removeLayer(Query.extraLayers[i]);
            } catch (e) {}
        }
    }
    this.AddQuery = function(Query) {
        if (this.GetQueryById(Query.GUID) == null) {
            this.Querys.push(Query);
        }
    }

    this.RemoveQuery = function(Query) {
        this.RemoveQueryById(Query.GUID);
    }
    //Farah For Delete
    this.RemoveQueryById = function(id) {
        var index0 = this.GetQueryIndex(id);
        //console.log(this.Querys[index0].LayerGroups)
        if (index0 != -1) {
            this.RemoveQueryFromMap(this.GetQueryByQueryId(this.Querys[index0].QueryId));
            var Vindex = VisSelected.indexOf(id);
            this.Querys.splice(index0, 1);
            if (VisSelected[0] == id); {
                VisSelected = []
                if (this.Querys.length > 0)
					self.ToggleQueryVisibility(this.Querys[this.Querys.length - 1]);
                    //VisSelected.push(this.Querys[this.Querys.length - 1].QueryId);
				DrawChart();
            }

        }
    }

    this.GetQueryById = function(id) {
        var index = this.GetQueryIndex(id);
        if (index != -1) {
            return this.Querys[index];
        }
        return null;
    }

    this.GetQueryByQueryId = function(id) {
        for (var x = 0; x < this.Querys.length; x++) {
            if (this.Querys[x].QueryId == id) {
                return this.Querys[x];
            }
        }

        return null;
    }

    this.GetQueryIndex = function(id) {
        for (var i = 0; i < this.Querys.length; i++) {
            if (this.Querys[i].GUID == id) {
                return i;
            }
        }

        return -1;
    }
    this.SetQueryName = function(Query, name) {
        Query.Name = name;
        Query.DOMLink['QueryName'].val(name);

    }

    this.AddQueryControl = function(r) {
        var Query = r;
        var container = $("#listView2");
        Query.DOMLink['container'] = $("<div></div>")
            .addClass("RC")
            .prop("id", Query.QueryId)
            .prop("value", "Highlight " + Query.QueryId)
            .css("border-left", "4px solid " + Query.Color)
            .appendTo(container);
        Query.DOMLink['QueryName'] = $("<input />")
            .prop({
                type: "text",
                value: Query.Name,
                size: "10",
            })
            .appendTo(Query.DOMLink['container'])
            .on("change", function() {
                self.SetQueryName(Query, $(this).val());
            });
        //Farah For Delete
        Query.DOMLink['delete'] = $("<div></div>")
            .prop({
                value: "Delete " + Query.QueryId
            })
            .on("click", function(e) {
                e.stopPropagation();
                self.RemoveQuery(Query);
                Query.DOMLink['container'].remove();
				if(TempQO.QueryId == Query.QueryId){
					clearMap();
					$("#singleSort").data('kendoGrid').dataSource.data([]);
					$("#singleSort1").data('kendoGrid').dataSource.data([]);
					$("#singleSort2").data('kendoGrid').dataSource.data([]);
					VisSelected = []
				}
            })
            .addClass("icon iconDelete")
            .appendTo(Query.DOMLink['container']);

        //Farah for hide and show
        Query.DOMLink['hide'] = $("<div></div>")
            .prop({
                value: "Hide " + Query.QueryId,
                id: "hi" + Query.QueryId
            })
            .addClass("icon iconHide")
            .on("click", function(e) {
                e.stopPropagation();
                self.ToggleQueryVisibility(Query);
            })
            .appendTo(Query.DOMLink['container']);
		/*
        Query.DOMLink['se'] = $("<div></div>")
            .prop({
                value: "se " + Query.QueryId,
                id: "se" + Query.QueryId
            })
            .addClass("icon iconSe")
            .on("click", function(e) {

                self.ToggleQueryVis(Query);
            })
            .appendTo(Query.DOMLink['container']);
		*/
        Query.DOMLink['Edit'] = $("<div></div>")
            .prop({
                value: "Edit " + Query.QueryId,
                id: "Edit" + Query.QueryId
            })
            .addClass("icon iconEdit")
            .on("click", function(e) {
				ComplexQueryList = []
                edit = 1;
                Query.DOMLink['Edit'].addClass("iconActive");
                var color = Query.Color
				changeselectioncolor(color);
                editQId = Query.QueryId
                if (Query.Complex == 0)
                    ComplexQueryInfo(Query.Results, Query.parameters);
                else
                    ComplexQueryList = Query.parameters;

            })
            .appendTo(Query.DOMLink['container']);
    }
    this.Init();
})();
function hideQ(Query){
	if(Query){
		Query.DOMLink['hide'].removeClass("iconHide");
		Query.DOMLink['hide'].addClass("iconActive");
		Query.DOMLink['hide'].addClass("iconShow");
		//var Vindex = VisSelected.indexOf(Query.QueryId);
		//VisSelected.splice(Vindex, 1);
		if (VisSelected[0] == Query.QueryId) {
			this.hided = Query.QueryId
			VisSelected = []
			DrawChart();
		}
		for (var i = 0; i < Query.LayerGroups.length; i++) {
			try {
				if (Query.LayerGroups[i] != null)
					map.removeLayer(Query.LayerGroups[i]);
			} catch (e) {}
		}
		for (var i = 0; i < Query.extraLayers.length; i++) {
			try {
				if (Query.extraLayers[i] != null)
					map.removeLayer(Query.extraLayers[i]);
			} catch (e) {}
		}
		$("#singleSort").data('kendoGrid').dataSource.data([]);
		$("#singleSort1").data('kendoGrid').dataSource.data([]);
		$("#singleSort2").data('kendoGrid').dataSource.data([]);
		clearMap();
	}
}