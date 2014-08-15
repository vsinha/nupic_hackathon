window.NTA = {};

// for FaceOfGrok FOG Dygrpahs module
window.GROK = {
    util: {
        /**
         * Straight from the Definitive Guide to JavaScript (5th Ed.), by
         * David Flanagan.
         * @param {Object} p Prototype object to create an heir from.
         */
        heir: function(p) {
            function F() {}   // A dummy constructor function
            F.prototype = p;  // Specify the prototype object we want
            return new F();   // Invoke the constructor to create new object
        }
    }
};

// add a helper function to Backbone.View()
$.extend(Backbone.View.prototype, {
    /**
     * Sane way to add sub-views to a view
     * http://ianstormtaylor.com/rendering-views-in-backbonejs-isnt-always-simple/
     */
    assign: function(view, selector) {
       view.setElement(this.$(selector));
    }
});
