/**
 * Created by tfeng1 on 10/17/17.
 */

function SideBar(){
    var res = [];
    var queryOpe = [];
    var queryID = 0;
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

    // Get trip id of query, add to list, and run Intersect operation as default
    this.storeQuery = function(tripid,view){
        var curID = ++queryID;

        queryOpe.push({
            queryID: curID,
            queryName: 'Query ' + curID,
            visible: true,
            operation: 'Intersect',
            data: tripid
        });
        $('#listView').empty()

        var qu = container.selectAll('div')
            .data(queryOpe)
            .enter()
            .append('div')
            .attr('id',function(d){return d.queryID})
            .classed('RC',true);

        qu.append('input')
            .attr('type','text')
            .attr('size','7')
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
                        return;
                    }
                });
                d3.select('#'+d.queryID.toString()).remove();
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
        resOperation();

        function resOperation(){
            $.each(queryOpe,function(i,d){
                if(d.operation=='Union'){
                    res = res.concat(d.data);
                }else{
                    res = (res.length>0)?intersect(res,d.data):d.data;
                }
                if(!d.visible){
                    res = res.filter(function(x){
                        return !d.data.includes(x);
                    })
                }
                res = res.filter(function(item, pos) {
                    return res.indexOf(item) == pos;
                })
            });
            console.log(res,queryOpe[0])
            barchart_initial(view,function(barView){
                            view.query(res,barView)
            });
        }
        // return res;
    }
}