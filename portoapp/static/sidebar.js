/**
 * Created by tfeng1 on 10/17/17.
 */

function SideBar(){
    var res = [];
    var queryOpe = [];
    // var queryID = 0;
    var mv = d3.select('#toolbar').append('div').classed('MV',true);
    mv.append('span').text('Query Control')
        .on('click',function(){
            d3.select('#toolbar').classed('open',!d3.select('#toolbar').attr('class'))
            // if(d3.select('#toolbar').attr('class')){
            //     d3.select('#toolbar').classed('open',false)
            // }else{
            //     d3.select('#toolbar').classed('open',true)
            // }
        });


    var panel = d3.select('#toolbar').append('div').classed('controlBody',true).attr('align','center');
    var container = panel.append('div').attr('id','listView').classed('listContainer',true);
    var clearMap = d3.select('#toolbar').append('input').attr('id','clearmap').attr('type','button').attr('value','Clear');
    // var btnClear = panel.append('input').attr('id','btnClear').attr('type','button').attr('value','Clear Map')

    // Get trip id of query, add to list, and run Intersect operation as default
    this.storeQuery = function(tripid,qid,view,layer,time){
        var curID = qid;

        queryOpe.push({
            queryID: curID,
            queryName: 'Query ' + curID,
            visible: true,
            operation: 'Intersect',
            data: tripid,
            layer:layer,
            timerange:time
        });
        $('#listView').empty();

        var qu = container.selectAll('div')
            .data(queryOpe)
            .enter()
            .append('div')
            .attr('id',function(d){return 'q' + d.queryID})
            .classed('RC',true);

        qu.append('input')
            .attr('type','text')
            .attr('size','8')
            .attr('value',function(d){return 'Query '+ d.queryID.toString()})
            .on('change',function(d){
                d.queryName = d3.select(this).property('value')
            });
        qu.append('div').classed('icon',true)
            .attr('id',function(d){return 'delete-' + d.queryID.toString()})
            .style('background-image','url(porto/static/css/images/trash_icon.png)')
            .on('click',function(d){
                //delete query
                $.each(queryOpe,function(i,t){
                    if(t.queryID==d.queryID){
                        queryOpe.splice(i,1);

                        var para = {
                            qid: d.queryID,
                            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                        };
                        $.post('clear',para, function(d){
                            console.log(d)
                        });

                        return false;
                    }
                });
                // if(queryOpe.length==0){clearAll();}

                d3.select('#q'+d.queryID.toString()).remove();
                view.deleteQuery(d.layer);
                res=[];

                resOperation();
            });
        qu.append('div').classed('icon',true)
            .attr('id',function(d){return 'union-' + d.queryID.toString()})
            .style('background-image','url(porto/static/css/images/union.png)')
            .style('background-color',function(d){
                if(d.operation == 'Union'){return '#EEA657'}
                else{return null}
            })
            .on('click',function(d){
                //union this query with others
                if(d.operation == 'Union'){return}
                else{
                    d.operation = 'Union'
                    d3.select(this).style('background-color','#EEA657')
                    d3.select('#intersect-' + d.queryID.toString()).style('background-color',null)
                };
                resOperation();
            });
        qu.append('div').classed('icon',true)
            .attr('id',function(d){return 'intersect-' + d.queryID.toString()})
            .style('background-image','url(porto/static/css/images/intersect.png)')
            .style('background-color',function(d){
                if(d.operation == 'Intersect'){return '#EEA657'}
                else{return null}
            })
            .on('click',function(d){
                //intersect this query with others
                if(d.operation == 'Intersect'){return}
                else{
                    d.operation = 'Intersect'
                    d3.select(this).style('background-color','#EEA657')
                    d3.select('#union-' + d.queryID.toString()).style('background-color',null)
                };
                resOperation();
            });
        qu.append('div').classed('icon',true)
            .attr('id',function(d){'hide-show-' + d.queryID.toString()})
            .style('background-image',function(d){
                if(d.visible){return 'url(porto/static/css/images/show_icon.png)'}
                else{return 'url(porto/static/css/images/hide_icon.png)'}
            })
            .on('click',function(d){
                //hide or show this query
                d.visible = !d.visible;
                imageurl = d.visible?'url(porto/static/css/images/show_icon.png)':'url(porto/static/css/images/hide_icon.png)';
                d3.select(this).style('background-image',imageurl);
                resOperation();
            });

        d3.select('#clearmap').on('click',clearAll);

        resOperation();

        // Logic operation function
        function resOperation(){
            res = [];
            // Delete the 'Hide' query
            $.each(queryOpe,function(i,d){
                if(!d.visible){
                    res = res.filter(function(x){
                        return !d.data.includes(x);
                    })
                }
            });
            // Operate the 'Union' operation
            $.each(queryOpe,function(i,d){
                if(d.operation=='Union' && d.visible){
                    res = res.concat(d.data);
                    // Delete the repeated items
                    res = res.filter(function(item, pos) {
                        return res.indexOf(item) == pos;
                    });
                }
            });

            // Then run the 'Intersect' operation
            $.each(queryOpe,function(i,d){
                if(d.operation=='Intersect' && d.visible){
                    res = (res.length>0)?intersect(res,d.data):d.data;
                }
            });



            console.log(res,'\n',queryOpe[0],'\n',queryOpe.length);

            // Update query status
            $('#query_state').show();
            $('#query_state>button').text('Pause');
            $('#query_state>button').show();
            $('#all').text('');
            $('#state').text('querying...');
            $('#all').text(res.length);


            barchart_initial(res,view,function(barView){
                            view.query(res,barView)
            });
        }
        // return res;

        function clearAll(){
            view.init();
            $('#listView').empty();
            $.each(queryOpe,function(i,d){
                view.deleteQuery(d.layer);
            });
            res=[];
            queryOpe=[];
            // queryID = 0;

            $.get('clear', function(d){
                console.log(d)
            })
        }
    }
}