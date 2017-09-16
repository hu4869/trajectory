var vis = vis || {};

vis.UI = new(function() {
    var self = this;
    
    this.regionControlManager = new (function() {
        var rc = this;
            
        this.options = {
            bottom: 0,
            width: "300px",
            height: "400px",
            open: true
        };
        
        this.hide = function() {
            this.options.open = false;
            $("#RControl").stop().animate({
                "height": 29
            }, 200, function() {
                //$("#RegionCreator").css("display", "none");
                $("#RControl .controlBody").css("display", "none");
            });
            
            
        }
        
        this.show = function() {
            this.options.open = true;
            $("#RControl").css("display", "block");
            $("#RControl .controlBody").css("display", "block");
            $("#RControl").stop().animate({
                "height": this.options.height
            }, 200);
        }
        
        this.toggle = function() {
            if (this.options.open) {
                this.hide();
            }
            else this.show();
        }
    });
    
    
})();

